"use client";

import * as React from "react";
import { HistoryIcon, SearchIcon, SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HistorialItem } from "@/components/chat/historial-item";
import { agruparPorFecha, filtrarConversaciones } from "@/lib/chat-historial";
import type { ResumenConversacion } from "@/lib/types";

interface Props {
  abierto: boolean;
  onAbierto: (v: boolean) => void;
  conversaciones: ResumenConversacion[];
  activa: string;
  onNueva: () => void;
  onAbrir: (id: string) => void;
  onRenombrar: (id: string, titulo: string) => void;
  onBorrar: (id: string) => void;
}

/** Panel lateral con las conversaciones guardadas: abrir, renombrar, borrar y crear una nueva. */
export function HistorialSheet({ abierto, onAbierto, conversaciones, activa, onNueva, onAbrir, onRenombrar, onBorrar }: Props) {
  const [consulta, setConsulta] = React.useState("");
  const grupos = React.useMemo(() => agruparPorFecha(filtrarConversaciones(conversaciones, consulta)), [conversaciones, consulta]);

  return (
    <Sheet open={abierto} onOpenChange={onAbierto}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <HistoryIcon className="size-4" /> Historial
          </SheetTitle>
          <SheetDescription>Conversaciones guardadas en este navegador.</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 border-b p-3">
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              onNueva();
              onAbierto(false);
            }}
          >
            <SquarePenIcon className="size-4" /> Nueva conversación
          </Button>
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={consulta} onChange={(e) => setConsulta(e.target.value)} placeholder="Buscar conversaciones" aria-label="Buscar conversaciones" className="pl-8" />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-3">
            {grupos.length === 0 ? (
              <p className="px-1 py-10 text-center text-sm text-muted-foreground">
                {conversaciones.length === 0 ? "Todavía no hay conversaciones guardadas." : "Sin resultados."}
              </p>
            ) : (
              grupos.map((g) => (
                <section key={g.etiqueta} className="space-y-1">
                  <h3 className="px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{g.etiqueta}</h3>
                  {g.items.map((c) => (
                    <HistorialItem key={c.id} conversacion={c} activa={c.id === activa} onAbrir={onAbrir} onRenombrar={onRenombrar} onBorrar={onBorrar} />
                  ))}
                </section>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
