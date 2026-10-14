import { getSupabaseClient } from "@/lib/rag";
import { BUCKET } from "./storage";

export interface NuevoDocumento {
  titulo: string;
  tipo: string;
  edificio_id: number | null;
  unidad_id: number | null;
  contrato_id: number | null;
  fecha_documento: string | null;
  sustituye_a: number | null;
  storage_path: string | null;
  mime: string | null;
  hash_sha256: string | null;
}

export interface FilaDocumento {
  id: number;
  titulo: string;
  tipo: string;
  storage_path: string | null;
  mime: string | null;
  hash_sha256: string | null;
  paginas: number | null;
  sustituye_a: number | null;
}

export interface NuevoFragmento {
  documento_id: number;
  orden: number;
  pagina: number | null;
  seccion: string | null;
  contenido: string;
  /** Título y tipo del documento: entran en el embedding y en la búsqueda por texto, no en lo que ve el modelo. */
  contexto: string;
  embedding: number[];
  embedding_model: string;
}

/** Almacenamiento de documentos: Supabase en producción, PGlite en las pruebas. */
export interface RepoDocumentos {
  crear(d: NuevoDocumento): Promise<number>;
  obtener(id: number): Promise<FilaDocumento | null>;
  actualizar(id: number, cambios: Record<string, unknown>): Promise<void>;
  porHash(hash: string, excluirId?: number): Promise<{ id: number; paginas: number | null } | null>;
  reemplazarFragmentos(documentoId: number, filas: NuevoFragmento[]): Promise<void>;
  /** Pasa a error los documentos que llevan «procesando» desde antes de `desde` (el proceso se interrumpió). */
  marcarAtascados(desde: string): Promise<number>;
  eliminar(id: number): Promise<void>;
  archivos: {
    subir(ruta: string, data: Uint8Array, contentType: string): Promise<void>;
    descargar(ruta: string): Promise<Uint8Array>;
    borrar(rutas: string[]): Promise<void>;
  };
}

export function supabaseRepo(): RepoDocumentos {
  const supabase = getSupabaseClient();
  return {
    async crear(d) {
      const { data, error } = await supabase
        .from("documentos")
        .insert({ ...d, estado_indexado: "pendiente" })
        .select("id")
        .single();
      if (error) throw new Error(`No se pudo registrar el documento: ${error.message}`);
      return data.id as number;
    },
    async obtener(id) {
      const { data, error } = await supabase
        .from("documentos")
        .select("id, titulo, tipo, storage_path, mime, hash_sha256, paginas, sustituye_a")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as FilaDocumento | null) ?? null;
    },
    async actualizar(id, cambios) {
      const { error } = await supabase.from("documentos").update(cambios).eq("id", id);
      if (error) throw new Error(`No se pudo actualizar el documento: ${error.message}`);
    },
    async porHash(hash, excluirId) {
      let q = supabase.from("documentos").select("id, paginas").eq("hash_sha256", hash);
      if (excluirId) q = q.neq("id", excluirId);
      const { data } = await q.maybeSingle();
      return data ?? null;
    },
    async reemplazarFragmentos(documentoId, filas) {
      // Una sola transacción en la base de datos: si falla, quedan los fragmentos anteriores
      const payload = filas.map((f) => ({ ...f, embedding: `[${f.embedding.join(",")}]` }));
      const { error } = await supabase.rpc("rpc_reemplazar_fragmentos", { p_documento: documentoId, p_filas: payload });
      if (error) throw new Error(`No se pudieron guardar los fragmentos: ${error.message}`);
    },
    async marcarAtascados(desde) {
      const { data, error } = await supabase
        .from("documentos")
        .update({ estado_indexado: "error", procesando_desde: null, error: "Se interrumpió el procesamiento (tiempo agotado). Vuelve a subir el archivo." })
        .eq("estado_indexado", "procesando")
        .lt("procesando_desde", desde)
        .select("id");
      if (error) throw new Error(`No se pudieron revisar los documentos atascados: ${error.message}`);
      return data?.length ?? 0;
    },
    async eliminar(id) {
      const { error } = await supabase.from("documentos").delete().eq("id", id);
      if (error) throw new Error(`No se pudo eliminar el documento: ${error.message}`);
    },
    archivos: {
      async subir(ruta, data, contentType) {
        const { error } = await supabase.storage.from(BUCKET).upload(ruta, data, { contentType, upsert: false });
        if (error) throw new Error(`No se pudo guardar el archivo: ${error.message}`);
      },
      async descargar(ruta) {
        const { data, error } = await supabase.storage.from(BUCKET).download(ruta);
        if (error || !data) throw new Error(`No se pudo leer el archivo: ${error?.message ?? "no existe"}`);
        return new Uint8Array(await data.arrayBuffer());
      },
      async borrar(rutas) {
        if (rutas.length === 0) return;
        const { error } = await supabase.storage.from(BUCKET).remove(rutas);
        if (error) throw new Error(`No se pudo borrar el archivo: ${error.message}`);
      },
    },
  };
}
