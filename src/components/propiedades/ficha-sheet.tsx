"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FichaCabecera } from "@/components/propiedades/ficha-cabecera";
import { FichaCaracteristicas } from "@/components/propiedades/ficha-caracteristicas";
import { FichaContrato } from "@/components/propiedades/ficha-contrato";
import { FichaIndice } from "@/components/propiedades/ficha-indice";
import { FichaPersonas } from "@/components/propiedades/ficha-personas";
import { FichaResumen } from "@/components/propiedades/ficha-resumen";
import { FichaUbicacion } from "@/components/propiedades/ficha-ubicacion";
import { FichaClientes, FichaDocumentos, FichaIncidencias } from "@/components/propiedades/ficha-listas";
import { CargandoFicha, ErrorCarga } from "@/components/panel/estado-carga";
import { useFichaPropiedad } from "@/hooks/use-propiedades";
import { useSeccionActiva } from "@/hooks/use-seccion-activa";
import { SECCIONES_FICHA, contarSecciones } from "@/lib/ficha";

const IDS_SECCIONES = SECCIONES_FICHA.map((s) => s.id);

/** Ficha lateral de un piso: cabecera, índice de anclas y todas las secciones con scroll. Se monta solo con una referencia abierta. */
export function FichaSheet({ referencia, onClose, enPanel = false }: { referencia: string | null; onClose: () => void; enPanel?: boolean }) {
  const { datos: ficha, loading, error, recargar } = useFichaPropiedad(referencia);
  const { activa, irA } = useSeccionActiva(IDS_SECCIONES, ficha);

  return (
    <Sheet open={referencia !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-4xl">
        <FichaCabecera ficha={ficha} referencia={referencia} enPanel={enPanel} />

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <FichaIndice activa={activa} cuentas={ficha ? contarSecciones(ficha) : {}} onIr={irA} />

          <ScrollArea className="min-h-0 min-w-0 flex-1">
            <div className="space-y-8 p-5">
              {loading && !ficha ? (
                <CargandoFicha />
              ) : error || !ficha ? (
                <ErrorCarga mensaje={error ?? "No se encontró la propiedad"} onReintentar={recargar} />
              ) : (
                <>
                  <FichaResumen ficha={ficha} />
                  <div className="grid gap-8 sm:grid-cols-2">
                    <FichaContrato ficha={ficha} />
                    <FichaPersonas ficha={ficha} />
                  </div>
                  <FichaCaracteristicas ficha={ficha} />
                  <FichaUbicacion ficha={ficha} />
                  <FichaDocumentos documentos={ficha.documentos} />
                  <FichaIncidencias incidencias={ficha.incidencias} />
                  <FichaClientes clientes={ficha.clientes_interesados} />
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
