"use client";

import * as React from "react";

interface Estado {
  error: Error | null;
}

/**
 * Aísla el error de un bloque para que no arrastre al resto de la pantalla.
 * Muestra el mensaje en lugar de dejar el hueco vacío.
 */
export class LimiteError extends React.Component<{ children: React.ReactNode }, Estado> {
  state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">No se pudo mostrar esta sección.</p>
          <p className="mt-1 text-xs text-muted-foreground">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
