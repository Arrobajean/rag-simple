"use client";

import * as React from "react";

export interface OpcionConfirmacion {
  titulo: string;
  descripcion?: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  destructivo?: boolean;
  /** Acción a ejecutar al confirmar. Puede ser asíncrona: el modal cierra al terminar. */
  onConfirmar: () => void | Promise<unknown>;
}

/**
 * Estado de un modal de confirmación reutilizable.
 * La UI lo pinta con `<ConfirmDialog {...dialogo} />` y las acciones lo abren con `pedir()`.
 */
export function useConfirmacion() {
  const [opcion, setOpcion] = React.useState<OpcionConfirmacion | null>(null);
  const [cargando, setCargando] = React.useState(false);
  const ref = React.useRef<OpcionConfirmacion | null>(null);

  const pedir = React.useCallback((o: OpcionConfirmacion) => {
    ref.current = o;
    setOpcion(o);
  }, []);

  const cerrar = React.useCallback(() => {
    if (cargando) return;
    ref.current = null;
    setOpcion(null);
  }, [cargando]);

  const confirmar = React.useCallback(async () => {
    const o = ref.current;
    if (!o) return;
    setCargando(true);
    try {
      await o.onConfirmar();
    } finally {
      setCargando(false);
      ref.current = null;
      setOpcion(null);
    }
  }, []);

  const dialogo = {
    abierto: opcion !== null,
    onAbiertoChange: (abierto: boolean) => {
      if (!abierto) cerrar();
    },
    titulo: opcion?.titulo ?? "",
    descripcion: opcion?.descripcion,
    textoConfirmar: opcion?.textoConfirmar,
    textoCancelar: opcion?.textoCancelar,
    destructivo: opcion?.destructivo,
    cargando,
    onConfirmar: () => void confirmar(),
  };

  return { pedir, dialogo };
}
