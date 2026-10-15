"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  titulo: string;
  descripcion?: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Pinta el botón de confirmar en rojo para acciones destructivas. */
  destructivo?: boolean;
  cargando?: boolean;
  onConfirmar: () => void;
}

/** Modal de confirmación reutilizable (borrados, descartes y demás acciones que exigen validar). */
export function ConfirmDialog({
  abierto,
  onAbiertoChange,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  destructivo = false,
  cargando = false,
  onConfirmar,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={abierto} onOpenChange={onAbiertoChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descripcion != null && <AlertDialogDescription>{descripcion}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cargando}>{textoCancelar}</AlertDialogCancel>
          <Button variant={destructivo ? "destructive" : "default"} disabled={cargando} onClick={onConfirmar}>
            {cargando && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
            {textoConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
