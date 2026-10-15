"use client";

import * as React from "react";

/** Línea de lectura: a este porcentaje de la altura del contenedor, la sección que la cruza es la activa. */
const LINEA_LECTURA = 0.3;

/**
 * Sección del índice que se está leyendo mientras se hace scroll, y `irA` para saltar a una.
 * `datos` cambia con cada ficha cargada: el oyente se vuelve a montar y el índice vuelve a la primera sección.
 */
export function useSeccionActiva(ids: readonly string[], datos: unknown) {
  const [activa, setActiva] = React.useState(ids[0]);

  React.useEffect(() => {
    if (!datos) return;

    // `scroll` no burbujea: se escucha en captura y se ignoran los contenedores que no tienen las secciones.
    const alScrollar = (e: Event) => {
      const contenedor = e.target;
      const primera = document.getElementById(ids[0]);
      if (!(contenedor instanceof HTMLElement) || !primera || !contenedor.contains(primera)) return;

      const secciones = ids.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const { top, bottom } = el.getBoundingClientRect();
        return [{ id, top, bottom }];
      });
      const linea = contenedor.getBoundingClientRect().top + contenedor.clientHeight * LINEA_LECTURA;
      const alFondo =
        contenedor.scrollHeight > contenedor.clientHeight && contenedor.scrollTop + contenedor.clientHeight >= contenedor.scrollHeight - 2;

      // Al llegar al final, la última sección aunque no alcance la línea (suele ser corta).
      let candidatas = alFondo ? secciones.slice(-1) : secciones.filter((s) => s.top <= linea && s.bottom > linea);
      if (candidatas.length === 0) candidatas = secciones.filter((s) => s.top <= linea).slice(-1);

      // Secciones hermanas en la misma fila (Contrato y Personas): se conserva la que ya estaba activa.
      setActiva((previa) => candidatas.find((s) => s.id === previa)?.id ?? candidatas[0]?.id ?? previa);
    };

    document.addEventListener("scroll", alScrollar, { capture: true, passive: true });
    return () => {
      document.removeEventListener("scroll", alScrollar, { capture: true });
      setActiva(ids[0]);
    };
  }, [ids, datos]);

  const irA = React.useCallback((id: string) => {
    setActiva(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return { activa, irA };
}
