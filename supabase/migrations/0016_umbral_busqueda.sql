-- 0016 · Umbral de similitud en la búsqueda de documentos
-- Sin umbral, el asistente recibía siempre 6 fragmentos aunque no tuvieran relación con la pregunta.
-- Con p_umbral, solo entran fragmentos cuya similitud coseno lo supera, también los encontrados por texto.
-- La similitud se devuelve para todas las filas (antes, las encontradas solo por texto venían sin ella).
-- Calibrado con `pnpm rag:eval` (src/lib/documents/busqueda.ts). Las funciones nuevas quedan sin ejecución
-- pública por los valores por defecto de 0009 y 0011.

-- Se recrea con la lista de argumentos explícita: si conviven varias firmas, un `drop ... rpc_buscar_documentos`
-- sin argumentos sería ambiguo (ERROR 42725). Se eliminan las dos firmas conocidas para poder re-ejecutar el
-- archivo completo aunque la 0017 ya estuviera aplicada (cambio de tipo de retorno).
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
  contenido text, vigente boolean, score double precision, similitud double precision, ambito text
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
         a.ambito
  from fusion f join ambito a on a.chunk_id = f.chunk_id
  -- Desempate por id: sin él, dos fragmentos con la misma puntuación RRF se ordenan según el plan de ejecución
  order by 9 desc, 1 asc
  limit greatest(p_count, 1);
end $$;
