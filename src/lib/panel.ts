import { eur, num, pct } from "@/lib/format";
import type { AgendaHoy, IngresosRiesgo, PuntoCobro, Resumen } from "@/lib/types";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-09" → "sep" */
export const mesCorto = (mes: string) => MESES[Number(mes.slice(5, 7)) - 1] ?? mes;

/** "2026-09" → "septiembre de 2026" */
export function mesLargo(mes: string): string {
  const d = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1, 1);
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export function saludoPorHora(hora: number): string {
  if (hora < 6) return "Buenas noches";
  if (hora < 13) return "Buenos días";
  if (hora < 21) return "Buenas tardes";
  return "Buenas noches";
}

/** Morosidad de un mes en %: lo que sigue sin cobrar sobre lo emitido. */
export const morosidadMes = (p: PuntoCobro) => (p.emitido > 0 ? (100 * p.impagado) / p.emitido : 0);

/** El último punto es el mes en curso (incompleto): no sirve como cifra cerrada. */
export const mesesCompletos = (serie: PuntoCobro[]) => serie.slice(0, -1);

/** Último mes cerrado, la referencia de cobros del panel. */
export function ultimoMesCerrado(serie: PuntoCobro[]): PuntoCobro | null {
  const cerrados = mesesCompletos(serie);
  return cerrados[cerrados.length - 1] ?? null;
}

/** A partir de este porcentaje, la morosidad se marca en aviso. */
export const UMBRAL_MOROSIDAD = 3;

export interface Indicador {
  titulo: string;
  valor: string;
  /** Contexto en euros o en pisos; null mientras no llega el dato que lo completa. */
  detalle: string | null;
  aviso: boolean;
}

/** Cuatro cifras que dicen cómo va la cartera: ocupación, morosidad, vencimientos y pisos sin alquilar. */
export function indicadoresPanel(r: Resumen, riesgo: IngresosRiesgo | null): Indicador[] {
  const i = r.indicadores;
  return [
    {
      titulo: "Ocupación",
      valor: pct(i.ocupacion_pct),
      detalle: `${num(i.alquiladas)} alquiladas · ${num(i.en_reforma)} en reforma`,
      aviso: false,
    },
    {
      titulo: "Morosidad",
      valor: pct(i.morosidad_pct),
      detalle: `${eur(i.impagado)} sin cobrar`,
      aviso: (i.morosidad_pct ?? 0) > UMBRAL_MOROSIDAD,
    },
    {
      titulo: "Vencen en 90 días",
      valor: num(i.contratos_vencen_90d),
      detalle: riesgo ? `${eur(riesgo.renta_en_riesgo.d90.renta)}/mes en juego` : null,
      aviso: i.contratos_vencen_30d > 0,
    },
    {
      titulo: "Libres para alquilar",
      valor: num(i.disponibles_alquiler),
      detalle: riesgo ? `${eur(riesgo.vacios.renta_mensual)}/mes sin ingresar` : null,
      aviso: false,
    },
  ];
}

export interface TramoRiesgo {
  etiqueta: string;
  renta: number;
  contratos: number;
  /** Peso del tramo frente al mayor, entre 0 y 1: mide la barra de cada columna. */
  proporcion: number;
}

/** Renta en riesgo por tramo de vencimiento, con el peso de cada uno frente al mayor. */
export function tramosRiesgo(riesgo: IngresosRiesgo): TramoRiesgo[] {
  const r = riesgo.renta_en_riesgo;
  const tramos = [
    { etiqueta: "En 30 días", renta: r.d30.renta, contratos: r.d30.contratos },
    { etiqueta: "En 60 días", renta: r.d60.renta, contratos: r.d60.contratos },
    { etiqueta: "En 90 días", renta: r.d90.renta, contratos: r.d90.contratos },
  ];
  const mayor = Math.max(1, ...tramos.map((t) => t.renta));
  return tramos.map((t) => ({ ...t, proporcion: t.renta / mayor }));
}

export interface NivelAgenda {
  nivel: 1 | 2 | 3;
  etiqueta: string;
  total: number;
}

/** Cuántas tareas hay en cada nivel de prioridad (totales reales, no solo las visibles). */
export function nivelesAgenda(agenda: AgendaHoy): NivelAgenda[] {
  return [
    { nivel: 1, etiqueta: "Hoy", total: agenda.por_nivel.hoy },
    { nivel: 2, etiqueta: "Esta semana", total: agenda.por_nivel.semana },
    { nivel: 3, etiqueta: "Cuando se pueda", total: agenda.por_nivel.luego },
  ];
}
