"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, DownloadIcon, HistoryIcon, MoreHorizontalIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  titulo: string;
  hayConversacion: boolean;
  onHistorial: () => void;
  onNueva: () => void;
  onCopiar: () => void;
  onDescargar: () => void;
  onBorrar: () => void;
}

/** Barra sobre el chat: título a la izquierda; Historial y Nueva conversación siempre a la vista a la derecha. */
export function ChatCabecera({ titulo, hayConversacion, onHistorial, onNueva, onCopiar, onDescargar, onBorrar }: Props) {
  const [copiado, setCopiado] = React.useState(false);

  const copiar = () => {
    onCopiar();
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4">
      <p className="min-w-0 truncate text-sm font-medium">{titulo}</p>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onHistorial} aria-label="Ver historial de conversaciones">
          <HistoryIcon /> <span className="hidden sm:inline">Historial</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onNueva} aria-label="Nueva conversación">
          <SquarePenIcon /> <span className="hidden sm:inline">Nueva conversación</span>
        </Button>
        {hayConversacion && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Más opciones de la conversación" />}>
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onClick={copiar}>
                {copiado ? <CheckIcon /> : <CopyIcon />} Copiar conversación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDescargar}>
                <DownloadIcon /> Descargar como Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onBorrar}>
                <Trash2Icon /> Borrar conversación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
