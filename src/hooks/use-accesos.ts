"use client";

import * as React from "react";
import { listarAccesos } from "@/lib/api";
import { useCarga } from "@/hooks/use-carga";

/** Registro de accesos (solo administradores) con filtro por método y paginación. */
export function useAccesos() {
  const [metodo, setMetodo] = React.useState("");
  const [pagina, setPagina] = React.useState(1);
  const estado = useCarga(() => listarAccesos({ metodo: metodo || undefined, pagina }), [metodo, pagina]);

  const cambiarMetodo = React.useCallback((m: string) => {
    setMetodo(m);
    setPagina(1);
  }, []);

  const totalPaginas = Math.max(1, Math.ceil((estado.datos?.total ?? 0) / 25));
  return { ...estado, metodo, cambiarMetodo, pagina, setPagina, totalPaginas };
}
