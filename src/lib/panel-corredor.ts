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
