"use client";

import * as React from "react";

interface Configuracion {
  /** Abre el diálogo de configuración (perfil, tema y conversación guardada). */
  abrir: () => void;
}

export const ConfiguracionContext = React.createContext<Configuracion | null>(null);

/** Acceso al diálogo de configuración desde el pie del sidebar y desde el menú lateral. */
export function useConfiguracion(): Configuracion {
  const c = React.useContext(ConfiguracionContext);
  if (!c) throw new Error("useConfiguracion debe usarse dentro de ConfiguracionProvider");
  return c;
}
