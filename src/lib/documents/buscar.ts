import type { DataAccess } from "@/lib/chat/data";
import { toVector } from "@/lib/rag";
import { UMBRAL_SIMILITUD } from "./busqueda";
import { rerankear } from "./rerank";

/** Candidatos que pide la búsqueda antes de reordenar: el reordenador elige el top entre ellos. */
export const CANDIDATOS = 20;

export interface FiltrosBusqueda {
  consulta: string;
  unidadId?: number | null;
  edificioId?: number | null;
  tipos?: string[] | null;
  limite: number;
  incluirNoVigentes?: boolean;
}

export interface FragmentoRecuperado {
  chunk_id: number;
  documento_id: number;
  titulo: string;
  tipo: string;
  pagina: number | null;
  seccion: string | null;
  contenido: string;
  vigente: boolean;
  ambito: string;
  /** Similitud coseno con la consulta (0-1). Siempre por encima de UMBRAL_SIMILITUD. */
  similitud: number | null;
  /** Edificio al que pertenece el documento: «E-00001 · Calle de Toledo, 45». */
  edificio: string | null;
}

/** Reordena los candidatos y devuelve sus índices. Por defecto, el modelo; en la evaluación, una caché. */
export type Reordenar = (consulta: string, candidatos: FragmentoRecuperado[]) => Promise<number[]>;

interface FilaRpc {
  chunk_id: number;
  documento_id: number;
  titulo: string;
  tipo: string;
  pagina: number | null;
  seccion: string | null;
  contenido: string;
  vigente: boolean;
  ambito: string;
  similitud: number | null;
  edificio_ref: string | null;
  edificio_direccion: string | null;
}

/**
 * Búsqueda híbrida con umbral y reordenación: el RPC devuelve hasta CANDIDATOS fragmentos por encima del umbral,
 * y si hay más que el límite, el reordenador deja los mejores `limite` al frente.
 */
export async function buscarFragmentos(
  data: DataAccess,
  embed: (texto: string) => Promise<number[]>,
  f: FiltrosBusqueda,
  { reordenar = rerankear }: { reordenar?: Reordenar } = {}
): Promise<FragmentoRecuperado[]> {
  const vector = await embed(f.consulta);
  const filas = await data.rpc<FilaRpc[]>("rpc_buscar_documentos", {
    query_embedding: toVector(vector),
    query_text: f.consulta,
    p_unidad: f.unidadId ?? null,
    p_edificio: f.edificioId ?? null,
    p_tipos: f.tipos?.length ? f.tipos : null,
    p_count: CANDIDATOS,
    p_incluir_no_vigentes: f.incluirNoVigentes ?? false,
    p_umbral: UMBRAL_SIMILITUD,
  });

  const candidatos: FragmentoRecuperado[] = filas.map((r) => ({
    chunk_id: Number(r.chunk_id),
    documento_id: Number(r.documento_id),
    titulo: r.titulo,
    tipo: r.tipo,
    pagina: r.pagina === null ? null : Number(r.pagina),
    seccion: r.seccion,
    contenido: r.contenido,
    vigente: r.vigente,
    ambito: r.ambito,
    similitud: r.similitud === null ? null : Number(Number(r.similitud).toFixed(3)),
    edificio: r.edificio_ref ? `${r.edificio_ref} · ${r.edificio_direccion ?? ""}`.replace(/ · $/, "") : null,
  }));

  if (candidatos.length <= f.limite) return candidatos;
  const orden = await reordenar(f.consulta, candidatos);
  return orden.slice(0, f.limite).map((i) => candidatos[i]);
}
