import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eur, pct } from "@/lib/format";
import { mesCorto, mesLargo, morosidadMes, ultimoMesCerrado } from "@/lib/panel";
import type { PuntoCobro } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Lo emitido cada mes y, en ámbar, lo que sigue sin cobrar. El mes en curso va atenuado porque aún cambia. */
export function GraficaCobros({ serie, className }: { serie: PuntoCobro[]; className?: string }) {
  const cerrado = ultimoMesCerrado(serie);
  const max = Math.max(1, ...serie.map((p) => p.emitido));

  return (
    <Card size="sm" className={cn("min-h-0 shadow-xs", className)}>
      <CardHeader>
        <CardTitle>Cobros por mes</CardTitle>
        <CardDescription className="text-xs">
          {cerrado
            ? `${mesLargo(cerrado.mes)}: ${eur(cerrado.impagado)} sin cobrar de ${eur(cerrado.emitido)} (${pct(morosidadMes(cerrado))})`
            : "Sin meses cerrados todavía"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex min-h-24 flex-1 items-end gap-1.5" role="img" aria-label="Cobros de los últimos meses">
          {serie.map((p, i) => {
            const enCurso = i === serie.length - 1;
            const parteImpagada = p.emitido ? Math.min(100, (p.impagado / p.emitido) * 100) : 0;
            return (
              <div
                key={p.mes}
                title={`${mesLargo(p.mes)}: emitido ${eur(p.emitido)}, sin cobrar ${eur(p.impagado)}`}
                className={cn("flex h-full min-w-0 flex-1 flex-col items-center gap-1.5", enCurso && "opacity-60")}
              >
                <div className="flex w-full flex-1 items-end">
                  <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm bg-primary/50" style={{ height: `${(p.emitido / max) * 100}%` }}>
                    {p.impagado > 0 && <div className="w-full bg-amber-500" style={{ height: `${Math.max(parteImpagada, 4)}%` }} />}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground capitalize">{mesCorto(p.mes)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-sm bg-primary/50" /> Emitido
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-sm bg-amber-500" /> Sin cobrar
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
