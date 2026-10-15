import { BathIcon, BedDoubleIcon, RulerIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { dec, eur } from "@/lib/format";
import { operacion, tipoUnidad } from "@/lib/etiquetas";
import type { FichaPropiedad } from "@/lib/types";

function Stat({ icono: Icono, etiqueta, valor }: { icono: React.ComponentType<{ className?: string }>; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icono className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{etiqueta}</p>
        <p className="truncate text-sm font-medium tabular-nums">{valor}</p>
      </div>
    </div>
  );
}

/** Cabecera de la ficha: precio destacado y cifras clave de la unidad. */
export function FichaResumen({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad as Record<string, unknown>;
  const esVenta = u.operacion === "venta";
  const precio = u.precio ? `${eur(Number(u.precio))}${esVenta ? "" : "/mes"}` : "—";

  return (
    <Card className="shadow-xs">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={esVenta ? "default" : "secondary"}>{operacion(String(u.operacion))}</Badge>
          <span className="text-xs text-muted-foreground">{tipoUnidad(String(u.tipo))}</span>
        </div>
        <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">{precio}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 sm:grid-cols-3">
          <Stat icono={RulerIcon} etiqueta="Superficie" valor={u.superficie_m2 ? `${dec(Number(u.superficie_m2))} m²` : "—"} />
          <Stat icono={BedDoubleIcon} etiqueta="Habitaciones" valor={u.habitaciones != null ? String(u.habitaciones) : "—"} />
          <Stat icono={BathIcon} etiqueta="Baños" valor={u.banos != null ? String(u.banos) : "—"} />
          <Stat icono={TrendingUpIcon} etiqueta="Precio / m²" valor={u.precio_m2 ? dec(Number(u.precio_m2)) : "—"} />
        </div>
      </CardContent>
    </Card>
  );
}
