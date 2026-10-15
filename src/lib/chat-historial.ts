import type { ResumenConversacion } from "@/lib/types";

export interface GrupoConversaciones {
  etiqueta: string;
  items: ResumenConversacion[];
}

const DIA = 86_400_000;

const inicioDelDia = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

/** Agrupa por antigüedad para la lista del historial (llega ya ordenada, de más reciente a más antigua). */
export function agruparPorFecha(items: ResumenConversacion[], ahora: number = Date.now()): GrupoConversaciones[] {
  const grupos: GrupoConversaciones[] = [
    { etiqueta: "Hoy", items: [] },
    { etiqueta: "Ayer", items: [] },
    { etiqueta: "Últimos 7 días", items: [] },
    { etiqueta: "Últimos 30 días", items: [] },
    { etiqueta: "Anteriores", items: [] },
  ];
  const hoy = inicioDelDia(ahora);
  for (const c of items) {
    const dias = Math.round((hoy - inicioDelDia(c.actualizada)) / DIA);
    const g = dias <= 0 ? 0 : dias === 1 ? 1 : dias < 7 ? 2 : dias < 30 ? 3 : 4;
    grupos[g].items.push(c);
  }
  return grupos.filter((g) => g.items.length > 0);
}

/** Filtra por título (búsqueda del historial). */
export function filtrarConversaciones(items: ResumenConversacion[], consulta: string): ResumenConversacion[] {
  const q = consulta.trim().toLowerCase();
  if (!q) return items;
  return items.filter((c) => c.titulo.toLowerCase().includes(q));
}

/** Título de la conversación abierta; `ninguno` mientras no esté guardada. */
export function tituloDeConversacion(items: ResumenConversacion[], id: string, ninguno: string): string {
  return items.find((c) => c.id === id)?.titulo ?? ninguno;
}

/** Textos del diálogo que confirma el borrado de una conversación (sidebar, barra del chat e historial). */
export const TEXTOS_BORRAR_CONVERSACION = {
  titulo: "¿Borrar esta conversación?",
  descripcion: "Se elimina de este navegador y no se puede recuperar.",
  textoConfirmar: "Borrar",
  destructivo: true,
};

/** Descripción corta del momento del último cambio. */
export function etiquetaHace(ms: number, ahora: number = Date.now()): string {
  const min = Math.floor((ahora - ms) / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  return new Date(ms).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
