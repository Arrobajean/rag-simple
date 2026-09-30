import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CargandoBloques({ n = 3 }: { n?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
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
