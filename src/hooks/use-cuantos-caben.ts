"use client";

import * as React from "react";

/** Altura de una fila de las listas del panel y hueco entre filas, en px. */
export const ALTO_FILA = 48;
export const SEPARACION_FILA = 6;

/**
 * Cuántas filas caben en el contenedor, para mostrar solo las que entran y no generar scroll.
 * `ref` es un callback (no un objeto) para que funcione aunque la lista aparezca después de cargar.
 */
export function useCuantosCaben<T extends HTMLElement>(altoFila: number, separacion: number) {
  const [elemento, setElemento] = React.useState<T | null>(null);
  const [caben, setCaben] = React.useState(1);

  React.useEffect(() => {
    if (!elemento) return;
    const observador = new ResizeObserver(() => {
      setCaben(Math.max(1, Math.floor((elemento.clientHeight + separacion) / (altoFila + separacion))));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [elemento, altoFila, separacion]);

  return { ref: setElemento, caben };
}
