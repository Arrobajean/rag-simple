import type { FichaPropiedad } from "@/lib/types";

/** Secciones de la ficha de un piso, en el orden del índice lateral. */
export const SECCIONES_FICHA = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "contrato", etiqueta: "Contrato" },
  { id: "personas", etiqueta: "Personas" },
  { id: "ubicacion", etiqueta: "Ubicación" },
  { id: "documentos", etiqueta: "Documentos" },
  { id: "incidencias", etiqueta: "Incidencias" },
  { id: "clientes", etiqueta: "Clientes" },
] as const;

export type SeccionId = (typeof SECCIONES_FICHA)[number]["id"];

/** Cifra junto a cada entrada del índice. Las secciones sin cifra no la muestran. */
export function contarSecciones(ficha: FichaPropiedad): Partial<Record<SeccionId, number>> {
  return {
    personas: (ficha.contrato_vigente?.inquilino ? 1 : 0) + (ficha.propietario ? 1 : 0),
    documentos: ficha.documentos.length,
    incidencias: ficha.incidencias.length,
    clientes: ficha.clientes_interesados.length,
  };
}

export type TonoPago = "ok" | "retraso" | "pendiente" | "impagado";

/** Color de un recibo: pagado a tiempo, pagado con retraso, pendiente o impagado. */
export function tonoPago(pago: Record<string, unknown>): TonoPago {
  const estado = String(pago.estado);
  if (estado === "impagado") return "impagado";
  if (estado === "pendiente") return "pendiente";
  return Number(pago.dias_retraso) > 0 ? "retraso" : "ok";
}

export type SituacionCobro = "al corriente" | "con retraso" | "con impagos";

/** Situación según el recibo vencido más reciente. Los recibos pendientes aún no cuentan. */
export function situacionCobro(pagos: Record<string, unknown>[]): SituacionCobro | null {
  const ultimo = pagos.find((p) => tonoPago(p) !== "pendiente");
  if (!ultimo) return null;
  const tono = tonoPago(ultimo);
  return tono === "ok" ? "al corriente" : tono === "impagado" ? "con impagos" : "con retraso";
}

/** "2026-03-01" → "03/2026". */
export function periodoCorto(periodo: unknown): string {
  const m = String(periodo).match(/^(\d{4})-(\d{2})/);
  return m ? `${m[2]}/${m[1]}` : String(periodo);
}

/** "attr_permite_mascotas" → "Permite mascotas". */
export function etiquetaAtributo(clave: string): string {
  const limpio = clave.replace(/^attr_/, "").replace(/_/g, " ").trim();
  return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : clave;
}

/** Valor de un atributo del catálogo en texto legible. */
export function valorAtributo(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
}
