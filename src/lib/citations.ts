import type { FuenteDocumento } from "@/lib/chat/types";

/**
 * El modelo cita fragmentos como [F1], [F2][F3] o [F1, F2]. Se convierten en enlaces Markdown internos
 * (`[F1](cita:F1)`) solo cuando el id corresponde a una fuente realmente recuperada.
 * Lo que no es una cita válida no se muestra como si lo fuera: una [F9] inventada desaparece, y los números
 * sueltos ([56, 32, 64], identificadores de la ficha del edificio) se quitan.
 */
export function enlazarCitas(texto: string, fuentes: FuenteDocumento[] = []): string {
  const ids = new Set(fuentes.map((f) => f.id));
  return texto
    .replace(/( ?)\[(F\d+(?:\s*,\s*F\d+)*)\]/g, (_m, espacio: string, grupo: string) => {
      const validas = grupo.split(/\s*,\s*/).filter((id) => ids.has(id));
      return validas.length ? espacio + validas.map((id) => `[${id}](cita:${id})`).join("") : "";
    })
    .replace(/ ?\[\d+(?:\s*,\s*\d+)*\]/g, "");
}

/** Referencias de propiedad que el modelo escribe en el texto ("U-00285"). */
const REF_UNIDAD = /\bU-\d{3,6}\b/g;
/** Marcas de la zona privada de Unicode para apartar temporalmente enlaces y código ya presentes. */
const ABRE = "\uE000";
const CIERRA = "\uE001";

/**
 * Convierte las referencias de propiedad (U-00285) en enlaces internos a su ficha.
 * No toca lo que ya es un enlace ni el código en línea, para no anidar enlaces.
 */
export function enlazarReferencias(texto: string): string {
  const guardado: string[] = [];
  return (
    texto
      // A veces el modelo escribe la referencia como destino del propio enlace: [U-00285](U-00285). Se corrige a la ruta real.
      .replace(/\[([^\]]*)\]\((U-\d{3,6})\)/g, (_m, textoEnlace: string, ref: string) => `[${textoEnlace}](/dashboard/propiedades?ref=${ref})`)
      // Y a veces la envuelve en corchetes sin enlace: [U-00285]. Se quitan para que se enlace más abajo.
      .replace(/\[(U-\d{3,6})\](?!\()/g, "$1")
      .replace(/(`[^`]*`|\[[^\]]*\]\([^)]*\))/g, (m) => `${ABRE}${guardado.push(m) - 1}${CIERRA}`)
      .replace(REF_UNIDAD, (ref) => `[${ref}](/dashboard/propiedades?ref=${ref})`)
      .replace(new RegExp(`${ABRE}(\\d+)${CIERRA}`, "g"), (_m, i: string) => guardado[Number(i)])
  );
}

export const esCita = (href?: string) => !!href && href.startsWith("cita:");
export const idDeCita = (href: string) => href.slice("cita:".length);

/** Texto corto de una fuente: "Normas Toledo 45 · pág. 2 · ARTÍCULO 5". */
export function etiquetaFuente(f: FuenteDocumento): string {
  const partes = [f.titulo];
  if (f.pagina) partes.push(`pág. ${f.pagina}`);
  if (f.seccion) partes.push(f.seccion);
  return partes.join(" · ");
}

export function extracto(texto: string, max = 260): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  return limpio.length > max ? `${limpio.slice(0, max).trimEnd()}…` : limpio;
}
