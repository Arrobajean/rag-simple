import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ALTO_FILA, SEPARACION_FILA, useCuantosCaben } from "@/hooks/use-cuantos-caben";
import { eur, num } from "@/lib/format";
import { nivelesAgenda } from "@/lib/panel";
import { plazoAgenda } from "@/lib/panel-corredor";
import type { AgendaHoy, ItemAgenda } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLOR_NIVEL: Record<ItemAgenda["nivel"], string> = {
  1: "bg-destructive",
  2: "bg-amber-500",
  3: "bg-muted-foreground/50",
};

function Tarea({ tarea }: { tarea: ItemAgenda }) {
  return (
    <li className="flex h-12 shrink-0 items-center gap-3 rounded-lg border px-3">
      <span className={cn("size-2 shrink-0 rounded-full", COLOR_NIVEL[tarea.nivel])} aria-hidden />
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

/** Lo primero que hay que hacer hoy, por prioridad. Muestra tantas tareas como caben en la tarjeta. */
export function HoyCard({ agenda, cargando, error, onReintentar }: HoyCardProps) {
  const { ref, caben } = useCuantosCaben<HTMLUListElement>(ALTO_FILA, SEPARACION_FILA);

  return (
    <Card size="sm" className="min-h-0 shadow-xs">
      <CardHeader>
        <CardTitle>Para hoy</CardTitle>
        <CardDescription className="text-xs">
          {error && !agenda
            ? "No se pudo cargar"
            : !agenda
              ? "Cargando…"
              : agenda.total === 0
                ? "Todo al día"
                : `${eur(agenda.importe_en_juego)} en juego`}
        </CardDescription>
        {agenda && agenda.total > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
            {nivelesAgenda(agenda).map((n) => (
              <span key={n.nivel} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("size-2 rounded-full", COLOR_NIVEL[n.nivel])} />
                <span className="font-medium text-foreground tabular-nums">{num(n.total)}</span> {n.etiqueta.toLowerCase()}
              </span>
            ))}
          </div>
        )}
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
          <ul ref={ref} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
            {agenda.items.slice(0, caben).map((t) => (
              <Tarea key={t.clave} tarea={t} />
            ))}
          </ul>
        )}
        {agenda && agenda.total > 0 && (
          <Link href="/dashboard/alertas" className="flex items-center gap-1 text-xs text-primary hover:underline">
            Ver las {num(agenda.total)} tareas y alertas <ArrowRightIcon className="size-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
