"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { etiquetaFuente, extracto } from "@/lib/citations";
import { useAbrirFicha } from "@/components/chat/ficha-context";
import type { FuenteDocumento } from "@/lib/chat/types";

/** Desplegable con los fragmentos de documentos que respaldan la respuesta. */
export function MessageSources({ fuentes }: { fuentes: FuenteDocumento[] }) {
  const [open, setOpen] = React.useState(false);
  const abrir = useAbrirFicha();
  const Chevron = open ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} className="-ml-2 h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground">
        <BookOpenIcon className="mr-1 size-3" />
        {fuentes.length} fragmento{fuentes.length > 1 ? "s" : ""} de documentos
        <Chevron className="ml-1 size-3" />
      </Button>

      {open && (
        <div className="mt-1.5 w-full space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
          {fuentes.map((f) => (
            <div key={f.id} className="space-y-1 rounded-md border bg-background p-2.5">
              <div className="flex items-center justify-between gap-2">
                {abrir ? (
                  <button
                    type="button"
                    onClick={() => abrir.documento(f.documento_id, f.pagina)}
                    className="truncate text-left font-medium hover:underline"
                  >
                    <span className="mr-1.5 font-mono text-[10px] text-primary">[{f.id}]</span>
                    {etiquetaFuente(f)}
                  </button>
                ) : (
                  <Link
                    href={`/dashboard/documentos/${f.documento_id}${f.pagina ? `?pagina=${f.pagina}` : ""}`}
                    className="truncate font-medium hover:underline"
                  >
                    <span className="mr-1.5 font-mono text-[10px] text-primary">[{f.id}]</span>
                    {etiquetaFuente(f)}
                  </Link>
                )}
                <div className="flex shrink-0 gap-1">
                  {!f.vigente && <Badge variant="destructive" className="h-4 text-[10px]">Sustituido</Badge>}
                  {f.similitud !== null && <Badge variant="secondary" className="h-4 text-[10px]">{(f.similitud * 100).toFixed(0)} %</Badge>}
                </div>
              </div>
              {f.edificio && <p className="text-[11px] text-muted-foreground">{f.edificio}</p>}
              <p className="italic text-muted-foreground">&ldquo;{extracto(f.contenido, 320)}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
