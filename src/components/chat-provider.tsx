"use client";

import * as React from "react";
import { useRagChat } from "@/hooks/use-rag-chat";

type EstadoChat = ReturnType<typeof useRagChat>;

const ChatContext = React.createContext<EstadoChat | null>(null);

/**
 * La conversación vive en el layout del panel, no en la pantalla del asistente: así no se pierde al cambiar de
 * vista y una respuesta en curso sigue llegando aunque estés en otra pantalla.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useRagChat();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChat(): EstadoChat {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de ChatProvider");
  return ctx;
}
