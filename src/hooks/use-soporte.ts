"use client";

import * as React from "react";
import { listarSoporte, marcarSoporte } from "@/lib/api";
import { useCarga } from "@/hooks/use-carga";

/** Mensajes de soporte y feedback (solo administradores) con filtro por tipo y paginación. */
export function useSoporte() {
  const [tipo, setTipo] = React.useState("");
  const [pagina, setPagina] = React.useState(1);
  const { recargar, ...estado } = useCarga(() => listarSoporte({ tipo: tipo || undefined, pagina }), [tipo, pagina]);

  const cambiarTipo = React.useCallback((t: string) => {
    setTipo(t);
    setPagina(1);
  }, []);

  const marcar = React.useCallback(
    async (id: number, valor: "nuevo" | "revisado") => {
      await marcarSoporte(id, valor).catch(() => undefined);
      recargar();
    },
    [recargar]
  );

  const totalPaginas = Math.max(1, Math.ceil((estado.datos?.total ?? 0) / 25));
  return { ...estado, recargar, tipo, cambiarTipo, pagina, setPagina, totalPaginas, marcar };
}
