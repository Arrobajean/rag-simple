import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eur, num } from "@/lib/format";
import type { TramoRiesgo } from "@/lib/panel";

/** Renta en riesgo en un tablero: una columna por tramo de vencimiento, con su importe y su peso. */
export function RiesgoKanban({ tramos }: { tramos: TramoRiesgo[] }) {
  return (
    <Card size="sm" className="shadow-xs">
      <CardHeader>
        <CardTitle>Renta en riesgo</CardTitle>
        <CardDescription className="text-xs">Lo que dejarías de cobrar si no se renueva</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {tramos.map((t) => (
          <div key={t.etiqueta} className="flex flex-col gap-2 rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">{t.etiqueta}</p>
            <p className="text-base font-semibold tracking-tight tabular-nums">
              {eur(t.renta)}
              <span className="text-xs font-normal text-muted-foreground">/mes</span>
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.round(t.proporcion * 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{num(t.contratos)} contratos</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
