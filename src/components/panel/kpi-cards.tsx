import { Card, CardContent } from "@/components/ui/card";
import type { Indicador } from "@/lib/panel";
import { cn } from "@/lib/utils";

/** Cuatro cifras en una fila. El aviso se marca con color; el contexto cabe en una sola línea. */
export function KpiCards({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {indicadores.map((k) => (
        <li key={k.titulo}>
          <Card size="sm" className="h-full shadow-xs">
            <CardContent className="space-y-1">
              <h2 className="text-xs font-medium text-muted-foreground">{k.titulo}</h2>
              <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", k.aviso && "text-amber-600 dark:text-amber-400")}>{k.valor}</p>
              <p className="min-h-4 truncate text-xs text-muted-foreground">{k.detalle ?? " "}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
