import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { dec } from "@/lib/format";
import type { FichaPropiedad } from "@/lib/types";

function Celda({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="text-sm font-semibold tabular-nums">{valor}</p>
    </div>
  );
}

/** Cifras clave de la unidad en una franja con divisores, y la descripción debajo. */
export function FichaResumen({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad;

  return (
    <SeccionFicha id="resumen" titulo="Resumen" className="space-y-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
        <Celda etiqueta="Superficie" valor={u.superficie_m2 ? `${dec(Number(u.superficie_m2))} m²` : "—"} />
        <Celda etiqueta="Habitaciones" valor={u.habitaciones != null ? String(u.habitaciones) : "—"} />
        <Celda etiqueta="Baños" valor={u.banos != null ? String(u.banos) : "—"} />
        <Celda etiqueta="€/m²" valor={u.precio_m2 ? dec(Number(u.precio_m2)) : "—"} />
      </div>
      {u.descripcion ? <p className="text-sm leading-relaxed text-muted-foreground">{String(u.descripcion)}</p> : null}
    </SeccionFicha>
  );
}
