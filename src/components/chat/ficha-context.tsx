"use client";

import * as React from "react";

export interface AbrirFicha {
  propiedad: (referencia: string) => void;
  cliente: (id: number) => void;
  documento: (id: number, pagina?: number | null) => void;
}

/** Contexto de apertura de fichas laterales. Sin importar los paneles, para no crear ciclos. */
export const FichaContext = React.createContext<AbrirFicha | null>(null);

/** Devuelve los abridores de ficha si estamos dentro del asistente; null en cualquier otro sitio. */
export const useAbrirFicha = () => React.useContext(FichaContext);
