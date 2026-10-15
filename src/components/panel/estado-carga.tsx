import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto con la misma forma que el panel de inicio: evita el salto de diseño al llegar los datos. */
export function CargandoPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-7 w-72" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Skeleton className="min-h-48" />
        <Skeleton className="min-h-48" />
      </div>
    </div>
  );
}

export function CargandoBloques({ n = 3 }: { n?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

/** Esqueleto de la ficha lateral: mantiene la forma para que no parpadee el error mientras carga. */
export function CargandoFicha() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando ficha">
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

export function ErrorCarga({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex-1 space-y-2">
        <p className="font-medium">No se pudieron cargar los datos</p>
        <p className="text-muted-foreground">{mensaje}</p>
        {onReintentar && (
          <Button size="sm" variant="outline" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
