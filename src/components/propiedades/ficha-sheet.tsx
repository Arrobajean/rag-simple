"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EstadoBadge } from "@/components/propiedades/estado-badge";
import { FichaAtributos } from "@/components/propiedades/ficha-atributos";
import { FichaContrato } from "@/components/propiedades/ficha-contrato";
import { FichaDatos } from "@/components/propiedades/ficha-datos";
import { FichaResumen } from "@/components/propiedades/ficha-resumen";
import { FichaClientes, FichaDocumentos, FichaIncidencias } from "@/components/propiedades/ficha-listas";
import { FichaUbicacion } from "@/components/propiedades/ficha-ubicacion";
import { CargandoFicha, ErrorCarga } from "@/components/panel/estado-carga";
import { useFichaPropiedad } from "@/hooks/use-propiedades";

/** Ficha lateral de una propiedad. Se monta solo con una referencia abierta. */
export function FichaSheet({ referencia, onClose }: { referencia: string | null; onClose: () => void }) {
  const { datos: ficha, loading, error, recargar } = useFichaPropiedad(referencia);
  const u = ficha?.unidad as Record<string, unknown> | undefined;
  const meta = u ? [referencia, u.municipio, u.distrito ?? u.barrio, u.zona].filter(Boolean).join(" · ") : "Cargando ficha…";

  return (
    <Sheet open={referencia !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b px-4 py-3 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <SheetTitle className="truncate">{u ? String(u.ubicacion) : referencia}</SheetTitle>
              <SheetDescription className="truncate text-xs">{meta}</SheetDescription>
            </div>
            {u && <EstadoBadge estado={String(u.estado)} />}
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4 py-4">
            {loading && !ficha ? (
              <CargandoFicha />
            ) : error || !ficha ? (
              <ErrorCarga mensaje={error ?? "No se encontró la propiedad"} onReintentar={recargar} />
            ) : (
              <div className="space-y-6">
                <FichaResumen ficha={ficha} />
                <FichaDatos ficha={ficha} />
                <FichaUbicacion ficha={ficha} />
                <FichaAtributos atributos={ficha.atributos} />
                <FichaContrato ficha={ficha} />
                <FichaDocumentos documentos={ficha.documentos} />
                <FichaIncidencias incidencias={ficha.incidencias} />
                <FichaClientes clientes={ficha.clientes_interesados} />
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
