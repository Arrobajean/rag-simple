import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALTO_FILA, SEPARACION_FILA, useCuantosCaben } from "@/hooks/use-cuantos-caben";
import { eur, num } from "@/lib/format";
import type { Oportunidades } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ColumnaProps<T> {
  titulo: string;
  total: number;
  items: T[];
  vacio: string;
  render: (item: T) => React.ReactNode;
}

/** Una columna del tablero: cabecera con su total y filas que se recortan a lo que cabe. */
function Columna<T>({ titulo, total, items, vacio, render }: ColumnaProps<T>) {
  const { ref, caben } = useCuantosCaben<HTMLUListElement>(ALTO_FILA, SEPARACION_FILA);
  return (
    <div className="flex min-h-0 flex-col gap-2 rounded-lg bg-muted/40 p-2">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <p className="text-xs font-medium">{titulo}</p>
        <span className="text-xs text-muted-foreground tabular-nums">{num(total)}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-1 text-xs text-muted-foreground">{vacio}</p>
      ) : (
        <ul ref={ref} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
          {items.slice(0, caben).map((item, i) => (
            <li key={i} className="shrink-0">
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Oferta frente a demanda en un tablero: pisos libres con clientes que encajan, y clientes sin piso. */
export function CruceKanban({ datos, className }: { datos: Oportunidades; className?: string }) {
  return (
    <Card size="sm" className={cn("min-h-0 shadow-xs", className)}>
      <CardHeader>
        <CardTitle>Oferta y demanda</CardTitle>
        <CardDescription className="text-xs">Qué piso libre encaja con quién, y qué cliente aún no tiene piso</CardDescription>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        <Columna
          titulo="Pisos libres con clientes"
          total={datos.unidades_con_interesados}
          items={datos.items}
          vacio="Ningún piso libre encaja con clientes ahora."
          render={(o) => (
            <div className="flex h-12 items-center justify-between gap-2 rounded-md border bg-background px-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{o.ubicacion}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {num(o.clientes)} encajan · {o.mejor_cliente} ({o.mejor_puntuacion} %)
                </p>
              </div>
              {o.precio !== null && <p className="shrink-0 text-xs tabular-nums">{eur(o.precio)}</p>}
            </div>
          )}
        />
        <Columna
          titulo="Clientes sin piso"
          total={datos.demandas_sin_oferta}
          items={datos.sin_oferta}
          vacio="Todos los clientes con demanda tienen algún piso."
          render={(s) => (
            <div className="flex h-12 items-center justify-between gap-2 rounded-md border bg-background px-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{s.cliente}</p>
                <p className="truncate text-[11px] text-muted-foreground">{s.tipo}</p>
              </div>
              <p className="shrink-0 text-xs tabular-nums text-muted-foreground">{s.presupuesto_max ? `hasta ${eur(s.presupuesto_max)}` : "sin tope"}</p>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
