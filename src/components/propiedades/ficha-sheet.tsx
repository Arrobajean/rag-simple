"use client";

import * as React from "react";
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
import { LimiteError } from "@/components/error-boundary";
import { useFichaPropiedad } from "@/hooks/use-propiedades";
import { contarSecciones, type SeccionId } from "@/lib/ficha";

/** Ficha lateral de un piso: cabecera, índice de pestañas y la sección activa en el contenedor derecho. */
export function FichaSheet({ referencia, onClose, enPanel = false }: { referencia: string | null; onClose: () => void; enPanel?: boolean }) {
  const { datos: ficha, loading, error, recargar } = useFichaPropiedad(referencia);
  // La sección elegida se guarda junto a la referencia: al abrir otra ficha, vuelve a «Resumen» sin necesidad de efectos.
  const [sel, setSel] = React.useState<{ ref: string | null; seccion: SeccionId }>({ ref: null, seccion: "resumen" });
  const activa: SeccionId = sel.ref === referencia ? sel.seccion : "resumen";
  const irA = React.useCallback((id: string) => setSel({ ref: referencia, seccion: id as SeccionId }), [referencia]);

  return (
    <Sheet open={referencia !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-4xl">
        <FichaCabecera ficha={ficha} referencia={referencia} enPanel={enPanel} />

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <FichaIndice activa={activa} cuentas={ficha ? contarSecciones(ficha) : {}} onIr={irA} />

          {loading && !ficha ? (
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="p-5">
                <CargandoFicha />
              </div>
            </div>
          ) : error || !ficha ? (
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="p-5">
                <ErrorCarga mensaje={error ?? "No se encontró la propiedad"} onReintentar={recargar} />
              </div>
            </div>
          ) : (
            <ScrollArea key={activa} className="min-h-0 min-w-0 flex-1">
              <div className="p-5">
                <LimiteError>
                  {activa === "resumen" && (
                    <div className="space-y-8">
                      <FichaResumen ficha={ficha} />
                      <FichaCaracteristicas ficha={ficha} />
                    </div>
                  )}
                  {activa === "contrato" && <FichaContrato ficha={ficha} />}
                  {activa === "personas" && <FichaPersonas ficha={ficha} />}
                  {activa === "ubicacion" && <FichaUbicacion ficha={ficha} />}
                  {activa === "documentos" && <FichaDocumentos documentos={ficha.documentos} />}
                  {activa === "incidencias" && <FichaIncidencias incidencias={ficha.incidencias} />}
                  {activa === "clientes" && <FichaClientes clientes={ficha.clientes_interesados} />}
                </LimiteError>
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
