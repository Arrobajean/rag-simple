"use client";

import * as React from "react";
import { toast } from "sonner";
import { enviarSoporte, errorMessage } from "@/lib/api";
import type { TipoSoporte } from "@/lib/types";

/** Envío de un mensaje de soporte o feedback. Devuelve `true` si se guardó (para cerrar el diálogo). */
export function useEnviarSoporte() {
  const [enviando, setEnviando] = React.useState(false);

  const enviar = React.useCallback(async (tipo: TipoSoporte, mensaje: string, email?: string): Promise<boolean> => {
    setEnviando(true);
    try {
      await enviarSoporte({ tipo, mensaje, email });
      toast.success(tipo === "soporte" ? "Mensaje enviado al equipo de soporte" : "¡Gracias por tu sugerencia!");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "No se pudo enviar el mensaje"));
      return false;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { enviando, enviar };
}
