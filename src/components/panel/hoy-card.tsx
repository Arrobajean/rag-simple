import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { eur, num } from "@/lib/format";
import { plazoAgenda } from "@/lib/panel-corredor";
import type { AgendaHoy, ItemAgenda } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Tareas visibles a la vez; el resto se ve en Alertas. */
const TAREAS_VISIBLES = 4;

const COLOR_NIVEL: Record<ItemAgenda["nivel"], string> = {
  1: "bg-destructive",
  2: "bg-amber-500",
  3: "bg-muted-foreground/50",
};
const ETIQUETA_NIVEL: Record<ItemAgenda["nivel"], string> = { 1: "Hoy", 2: "Esta semana", 3: "Cuando se pueda" };

function descripcion(agenda: AgendaHoy | null, error: string | null): string {
  if (error) return "No se pudo cargar";
  if (!agenda) return "Cargando…";
  if (agenda.total === 0) return "Todo al día";
  return `${num(agenda.por_nivel.hoy)} para hoy · ${num(agenda.por_nivel.semana)} esta semana · ${eur(agenda.importe_en_juego)} en juego`;
}

function Tarea({ tarea }: { tarea: ItemAgenda }) {
  return (
    <li className="flex h-12 items-center gap-3 rounded-lg border px-3">
      <span className={cn("size-2 shrink-0 rounded-full", COLOR_NIVEL[tarea.nivel])} role="img" aria-label={ETIQUETA_NIVEL[tarea.nivel]} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tarea.titulo}</p>
        <p className="truncate text-xs text-muted-foreground">{[plazoAgenda(tarea), tarea.ubicacion].filter(Boolean).join(" · ")}</p>
      </div>
      {tarea.importe ? <p className="shrink-0 text-sm font-medium tabular-nums">{eur(tarea.importe)}</p> : null}
    </li>
  );
}

interface HoyCardProps {
  agenda: AgendaHoy | null;
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
}

/** Lo primero que hay que hacer hoy, por prioridad. Cada estado (cargando, error, vacío) ocupa el mismo sitio. */
export function HoyCard({ agenda, cargando, error, onReintentar }: HoyCardProps) {
  return (
    <Card size="sm" className="min-h-0 shadow-xs">
      <CardHeader>
        <CardTitle>Para hoy</CardTitle>
        <CardDescription className="text-xs">{descripcion(agenda, error)}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {error && !agenda ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Las tareas no están disponibles ahora.</span>
            <Button size="sm" variant="outline" onClick={onReintentar}>
              Reintentar
            </Button>
          </div>
        ) : !agenda || cargando ? (
          Array.from({ length: 3 }, (_, n) => <Skeleton key={n} className="h-12 w-full" />)
        ) : agenda.items.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2Icon className="size-4 shrink-0 text-emerald-500" /> Sin impagos, vencimientos inminentes ni incidencias urgentes.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {agenda.items.slice(0, TAREAS_VISIBLES).map((t) => (
              <Tarea key={t.clave} tarea={t} />
            ))}
          </ul>
        )}
        {agenda && agenda.total > TAREAS_VISIBLES && (
          <Link href="/dashboard/alertas" className="mt-auto flex items-center gap-1 text-xs text-primary hover:underline">
            Ver las {num(agenda.total)} tareas y alertas <ArrowRightIcon className="size-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
