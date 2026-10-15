"use client";

import * as React from "react";
import { ConfiguracionDialog } from "@/components/configuracion-dialog";
import { ConfiguracionContext } from "@/hooks/use-configuracion";
import { usePerfil } from "@/hooks/use-perfil";
import { useSesion } from "@/hooks/use-sesion";

/** Monta el diálogo de configuración una sola vez y expone `abrir` al resto del panel. */
export function ConfiguracionProvider({ children }: { children: React.ReactNode }) {
  const { rol, abierto, nombre: nombreSesion, salir } = useSesion();
  const { nombre: nombreLocal, setNombre } = usePerfil();
  const [visible, setVisible] = React.useState(false);
  const nombre = nombreSesion || nombreLocal;
  const valor = React.useMemo(() => ({ abrir: () => setVisible(true) }), []);

  return (
    <ConfiguracionContext.Provider value={valor}>
      {children}
      <ConfiguracionDialog open={visible} onOpenChange={setVisible} nombre={nombre} onNombre={setNombre} nombreFijo={!!nombreSesion} rol={rol} abierto={abierto} onSalir={salir} />
    </ConfiguracionContext.Provider>
  );
}
