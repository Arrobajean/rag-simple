"use client";

import * as React from "react";
import { CheckIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { etiquetaHace } from "@/lib/chat-historial";
import type { ResumenConversacion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  conversacion: ResumenConversacion;
  activa: boolean;
  onAbrir: (id: string) => void;
  onRenombrar: (id: string, titulo: string) => void;
  onBorrar: (id: string) => void;
}

/** Una fila del historial: abrir, renombrar en línea y borrar. */
export function HistorialItem({ conversacion, activa, onAbrir, onRenombrar, onBorrar }: Props) {
  const [renombrando, setRenombrando] = React.useState(false);
  const [borrador, setBorrador] = React.useState(conversacion.titulo);

  const empezar = () => {
    setBorrador(conversacion.titulo);
    setRenombrando(true);
  };

  if (renombrando) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onRenombrar(conversacion.id, borrador);
          setRenombrando(false);
        }}
        className="flex items-center gap-1 rounded-lg border bg-background p-1"
      >
        <Input
          autoFocus
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setRenombrando(false);
          }}
          maxLength={60}
          aria-label="Nuevo título"
          className="h-8 flex-1"
        />
        <Button type="submit" size="icon-sm" variant="ghost" aria-label="Guardar título">
          <CheckIcon className="size-4" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Cancelar" onClick={() => setRenombrando(false)}>
          <XIcon className="size-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className={cn("group flex items-center gap-1 rounded-lg border border-transparent pr-1 transition-colors hover:bg-muted", activa && "border-border bg-muted")}>
      <button type="button" onClick={() => onAbrir(conversacion.id)} className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-2.5 py-2 text-left">
        <span className={cn("w-full truncate text-sm", activa && "font-medium")}>{conversacion.titulo}</span>
        <span className="text-xs text-muted-foreground">
          {etiquetaHace(conversacion.actualizada)} · {conversacion.mensajes} mensajes
        </span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Opciones de la conversación"
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
            />
          }
        >
          <MoreHorizontalIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={empezar}>
            <PencilIcon /> Renombrar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onBorrar(conversacion.id)}>
            <Trash2Icon /> Borrar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
