"use client";

import * as React from "react";
import { FichaClienteSheet } from "@/components/clientes/ficha-cliente-sheet";
import { DocumentoSheet } from "@/components/documentos/documento-sheet";
import { FichaSheet } from "@/components/propiedades/ficha-sheet";
import { FichaContext, type AbrirFicha } from "@/components/chat/ficha-context";

/**
 * Abre las fichas de propiedad, cliente y documento como panel lateral, sin salir de la vista actual.
 * Los enlaces y citas de las respuestas del asistente lo usan; fuera de aquí caen a la navegación normal.
 */
export function FichaProvider({ children }: { children: React.ReactNode }) {
  const [referencia, setReferencia] = React.useState<string | null>(null);
  const [clienteId, setClienteId] = React.useState<number | null>(null);
  const [documento, setDocumento] = React.useState<{ id: number; pagina: number | null } | null>(null);

  const abrir = React.useMemo<AbrirFicha>(
    () => ({
      propiedad: (ref) => {
        setClienteId(null);
        setDocumento(null);
        setReferencia(ref);
      },
      cliente: (id) => {
        setReferencia(null);
        setDocumento(null);
        setClienteId(id);
      },
      documento: (id, pagina = null) => {
        setReferencia(null);
        setClienteId(null);
        setDocumento({ id, pagina });
      },
    }),
    []
  );

  return (
    <FichaContext.Provider value={abrir}>
      {children}
      <FichaSheet referencia={referencia} onClose={() => setReferencia(null)} enPanel />
      <FichaClienteSheet id={clienteId} onClose={() => setClienteId(null)} onAbrirPropiedad={abrir.propiedad} />
      <DocumentoSheet id={documento?.id ?? null} pagina={documento?.pagina ?? null} onClose={() => setDocumento(null)} />
    </FichaContext.Provider>
  );
}
