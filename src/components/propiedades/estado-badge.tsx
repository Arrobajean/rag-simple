import { Badge } from "@/components/ui/badge";
import { estadoUnidad, tonoEstado } from "@/lib/etiquetas";
import { cn } from "@/lib/utils";

const TONOS = {
  ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  muted: "bg-muted text-muted-foreground",
} as const;

const TONOS_TEXTO = {
  ok: "text-emerald-600 dark:text-emerald-400",
  info: "text-sky-600 dark:text-sky-400",
  warn: "text-amber-600 dark:text-amber-400",
  muted: "text-muted-foreground",
} as const;

export function EstadoBadge({ estado }: { estado: string }) {
  return <Badge className={cn("border-transparent font-medium", TONOS[tonoEstado(estado)])}>{estadoUnidad(estado)}</Badge>;
}

/** Estado en texto de color, seguido de la situación de cobro si la hay: "Alquilada · al corriente". */
export function EstadoTexto({ estado, situacion }: { estado: string; situacion?: string | null }) {
  const texto = [estadoUnidad(estado), situacion].filter(Boolean).join(" · ");
  return <p className={cn("text-xs font-medium", TONOS_TEXTO[tonoEstado(estado)])}>{texto}</p>;
}
