"use client";

import * as React from "react";
import { useRagChat } from "@/hooks/use-rag-chat";

type Chat = ReturnType<typeof useRagChat>;
type EstadoChat = Pick<Chat, "messages" | "loading" | "contexto">;
type HistorialChat = Pick<Chat, "conversaciones" | "conversacionId">;
type AccionesChat = Omit<Chat, keyof EstadoChat | keyof HistorialChat>;

// Cuatro contextos para que cada consumidor se re-renderice solo por lo que usa:
//  · acciones: estables, no cambian nunca (botones, diálogos)
//  · cantidad: cambia al añadir o borrar mensajes, no con cada trozo de texto del streaming
//  · estado: mensajes, carga y contexto (solo la pantalla del asistente)
//  · historial: lista de conversaciones guardadas (solo el panel de historial)
const EstadoContext = React.createContext<EstadoChat | null>(null);
const HistorialContext = React.createContext<HistorialChat | null>(null);
const AccionesContext = React.createContext<AccionesChat | null>(null);
const CantidadContext = React.createContext(0);

/**
 * La conversación vive en el layout del panel, no en la pantalla del asistente: así no se pierde al cambiar de
 * vista y una respuesta en curso sigue llegando aunque estés en otra pantalla.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useRagChat();
  const { messages, loading, contexto, conversaciones, conversacionId } = chat;
  const estado = React.useMemo(() => ({ messages, loading, contexto }), [messages, loading, contexto]);
  const historial = React.useMemo(() => ({ conversaciones, conversacionId }), [conversaciones, conversacionId]);
  const accionesEstables = React.useMemo(
    () => ({
      send: chat.send, stop: chat.stop, nueva: chat.nueva, abrir: chat.abrir, renombrar: chat.renombrar,
      borrar: chat.borrar, borrarTodas: chat.borrarTodas, reintentar: chat.reintentar,
      confirmarAccion: chat.confirmarAccion, cancelarAccion: chat.cancelarAccion, deshacerAccion: chat.deshacerAccion, valorar: chat.valorar,
    }),
    [chat.send, chat.stop, chat.nueva, chat.abrir, chat.renombrar, chat.borrar, chat.borrarTodas, chat.reintentar, chat.confirmarAccion, chat.cancelarAccion, chat.deshacerAccion, chat.valorar]
  );

  return (
    <AccionesContext.Provider value={accionesEstables}>
      <CantidadContext.Provider value={messages.length}>
        <HistorialContext.Provider value={historial}>
          <EstadoContext.Provider value={estado}>{children}</EstadoContext.Provider>
        </HistorialContext.Provider>
      </CantidadContext.Provider>
    </AccionesContext.Provider>
  );
}

function useContextoObligatorio<T>(ctx: React.Context<T | null>, nombre: string): T {
  const valor = React.useContext(ctx);
  if (!valor) throw new Error(`${nombre} debe usarse dentro de ChatProvider`);
  return valor;
}

export const useChatEstado = () => useContextoObligatorio(EstadoContext, "useChatEstado");
export const useChatHistorial = () => useContextoObligatorio(HistorialContext, "useChatHistorial");
export const useChatAcciones = () => useContextoObligatorio(AccionesContext, "useChatAcciones");
export const useChatCantidad = () => React.useContext(CantidadContext);
