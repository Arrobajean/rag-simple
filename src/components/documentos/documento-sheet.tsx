"use client";

import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DocumentoDetalle } from "@/components/documento-detalle";

/** Ficha lateral de un documento (visor y fragmentos) para no salir del asistente. */
export function DocumentoSheet({ id, pagina, onClose }: { id: number | null; pagina: number | null; onClose: () => void }) {
  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-3xl">
        <SheetHeader className="sr-only">
          <SheetTitle>Documento</SheetTitle>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
          {id !== null && (
            <div className="pt-4">
              <Link
                href={`/dashboard/documentos/${id}${pagina ? `?pagina=${pagina}` : ""}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Abrir en la app <ExternalLinkIcon className="size-3" />
              </Link>
            </div>
          )}
          {id !== null && <DocumentoDetalle key={`${id}:${pagina ?? 1}`} id={id} paginaInicial={pagina ?? 1} enPanel />}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
