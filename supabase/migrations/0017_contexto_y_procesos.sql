-- 0017 · Contexto de documento en la búsqueda, edificio en cada resultado, escritura atómica de fragmentos,
-- control de procesos atascados y Word (.docx).

-- 1. Contexto: título y tipo del documento entran en el embedding y en el texto de búsqueda, pero no en lo que
-- ve el modelo (`contenido`). Los fragmentos anteriores quedan sin contexto hasta reindexar.
alter table document_chunks add column if not exists contexto text;
alter table document_chunks drop column if exists fts;
alter table document_chunks add column fts tsvector generated always as (
  to_tsvector('spanish', coalesce(contexto || ' ', '') || contenido)
) stored;
create index if not exists document_chunks_fts_idx on document_chunks using gin (fts);

-- 2. Inicio del procesamiento: permite detectar los documentos que se quedaron en «procesando» (corte por tiempo)
alter table documentos add column if not exists procesando_desde timestamptz;

-- 3. Escritura atómica: borrar los fragmentos anteriores e insertar los nuevos en una sola transacción.
-- El embedding llega como texto '[0.1,0.2,…]' y se convierte con SQL estándar (funciona también en PGlite).
create or replace function rpc_reemplazar_fragmentos(p_documento bigint, p_filas jsonb) returns int
language plpgsql as $$
declare
  n int;
begin
  delete from document_chunks where documento_id = p_documento;
  insert into document_chunks (documento_id, orden, pagina, seccion, contenido, contexto, embedding, embedding_model)
  select p_documento, x.orden, x.pagina, x.seccion, x.contenido, x.contexto,
         (string_to_array(trim(both '[]' from x.embedding), ',')::float8[])::vector(768),
         x.embedding_model
  from jsonb_to_recordset(p_filas) as x(
    orden int, pagina int, seccion text, contenido text, contexto text, embedding text, embedding_model text
  );
  get diagnostics n = row_count;
  return n;
end $$;

-- 4. Búsqueda híbrida con umbral (0016) y con el edificio de cada resultado, para no mezclar normas de dos edificios.
-- Se recrea porque cambia el tipo de retorno. Se eliminan las dos firmas conocidas con la lista de
-- argumentos explícita: un `drop ... rpc_buscar_documentos` sin argumentos sería ambiguo (ERROR 42725).
drop function if exists rpc_buscar_documentos(vector, text, bigint, bigint, text[], int, boolean);
drop function if exists rpc_buscar_documentos(vector, text, bigint, bigint, text[], int, boolean, double precision);

create or replace function rpc_buscar_documentos(
  query_embedding vector(768),
  query_text text default null,
  p_unidad bigint default null,
  p_edificio bigint default null,
  p_tipos text[] default null,
  p_count int default 8,
  p_incluir_no_vigentes boolean default false,
  p_umbral double precision default null
) returns table (
  chunk_id bigint, documento_id bigint, titulo text, tipo text, pagina int, seccion text,
  contenido text, vigente boolean, score double precision, similitud double precision, ambito text,
  edificio_ref text, edificio_direccion text
)
language plpgsql stable as $$
declare
  v_edificio bigint := p_edificio;
  v_tsq tsquery;
begin
  if p_unidad is not null and v_edificio is null then
    select edificio_id into v_edificio from unidades where id = p_unidad;
  end if;

  -- pgvector >= 0.8: sigue recorriendo el índice HNSW si los filtros descartan resultados.
  begin
    perform set_config('hnsw.iterative_scan', 'relaxed_order', true);
  exception when others then null;
  end;

  if query_text is not null and length(trim(query_text)) > 0 then
    v_tsq := nullif(replace(plainto_tsquery('spanish', query_text)::text, '&', '|'), '')::tsquery;
  end if;

  return query
  with ambito as (
    select ch.id as chunk_id, ch.documento_id, d.titulo, d.tipo::text as tipo, ch.pagina, ch.seccion,
           ch.contenido, d.vigente, ch.embedding, ch.fts,
           coalesce(d.edificio_id, ud.edificio_id) as edificio_id,
           case
             when coalesce(d.unidad_id, k.unidad_id) is not null then 'unidad'
             when coalesce(d.edificio_id, ud.edificio_id) is not null then 'edificio'
             else 'general'
           end as ambito
    from document_chunks ch
    join documentos d on d.id = ch.documento_id
    left join contratos k on k.id = d.contrato_id
    left join unidades ud on ud.id = coalesce(d.unidad_id, k.unidad_id)
    where d.estado_indexado = 'indexado'
      and (p_incluir_no_vigentes or d.vigente)
      and (p_tipos is null or d.tipo::text = any (p_tipos))
      -- Umbral: se aplica antes de fusionar, así el límite de candidatos cuenta solo lo que pasa el corte
      and (p_umbral is null or (1 - (ch.embedding <=> query_embedding)) >= p_umbral)
      and (
        (p_unidad is null and p_edificio is null)
        or (p_unidad is not null and coalesce(d.unidad_id, k.unidad_id) = p_unidad)
        or (p_unidad is not null and coalesce(d.unidad_id, k.unidad_id) is null
            and coalesce(d.edificio_id, ud.edificio_id) = v_edificio)
        or (p_unidad is null and coalesce(d.edificio_id, ud.edificio_id) = v_edificio)
        or (coalesce(d.edificio_id, ud.edificio_id) is null and coalesce(d.unidad_id, k.unidad_id) is null)
      )
  ),
  sem as (
    select a.chunk_id, row_number() over (order by a.embedding <=> query_embedding) as rk
    from ambito a
    where a.embedding is not null
    order by a.embedding <=> query_embedding
    limit 40
  ),
  lex as (
    select a.chunk_id, row_number() over (order by ts_rank_cd(a.fts, v_tsq) desc) as rk
    from ambito a
    where v_tsq is not null and a.fts @@ v_tsq
    order by ts_rank_cd(a.fts, v_tsq) desc
    limit 40
  ),
  fusion as (
    select coalesce(s.chunk_id, l.chunk_id) as chunk_id,
           coalesce(1.0 / (60 + s.rk), 0) + coalesce(1.0 / (60 + l.rk), 0) as score
    from sem s full outer join lex l on l.chunk_id = s.chunk_id
  )
  select a.chunk_id, a.documento_id, a.titulo, a.tipo, a.pagina, a.seccion, a.contenido, a.vigente,
         (f.score + case when a.vigente then 0.002 else 0 end)::double precision,
         (1 - (a.embedding <=> query_embedding))::double precision,
         a.ambito,
         e.referencia, e.direccion
  from fusion f
  join ambito a on a.chunk_id = f.chunk_id
  left join edificios e on e.id = a.edificio_id
  -- Desempate por id: sin él, dos fragmentos con la misma puntuación RRF se ordenan según el plan de ejecución
  order by 9 desc, 1 asc
  limit greatest(p_count, 1);
end $$;

-- 5. Word: el bucket privado admite .docx además de PDF, Markdown y texto
do $$ begin
  if to_regclass('storage.buckets') is not null then
    update storage.buckets
       set allowed_mime_types = array[
         'application/pdf', 'text/markdown', 'text/plain',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
     where id = 'documentos';
  end if;
end $$;
