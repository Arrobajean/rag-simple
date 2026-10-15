import { diasRelativos } from "@/lib/format";
import type { ItemAgenda } from "@/lib/types";

/** Texto corto del plazo de una tarea de la agenda según su tipo. */
export function plazoAgenda(i: ItemAgenda): string {
  switch (i.tipo) {
    case "impago":
      return `${i.dias} días de retraso`;
    case "contrato_vence":
      return `Vence ${diasRelativos(i.dias)}`;
    case "certificado_energetico":
      return `Caducado hace ${-i.dias} días`;
    case "fianza_pendiente":
      return `${i.dias} días sin depositar`;
    case "incidencia":
      return `Abierta hace ${i.dias} días`;
    default:
      return diasRelativos(i.dias);
  }
}

/** Preguntas rápidas sobre el día: al pulsarlas se envían tal cual al asistente. */
export const CONSULTAS_HOY = [
  { etiqueta: "¿Qué hago hoy?", pregunta: "¿Qué tengo que hacer hoy? Ordena las tareas por urgencia y dime qué resolver primero." },
  { etiqueta: "Impagos a reclamar", pregunta: "¿Qué impagos debo reclamar hoy? Ordénalos por importe y dime a quién escribir primero." },
  { etiqueta: "Renovar esta semana", pregunta: "¿Qué contratos vencen esta semana y cuáles conviene renovar primero por la renta que representan?" },
  { etiqueta: "Resumen de hoy", pregunta: "Resume en tres frases cómo va la cartera hoy: ocupación, cobros y lo que más riesgo tiene." },
];
