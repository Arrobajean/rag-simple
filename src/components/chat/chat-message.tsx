"use client";

import { motion, useReducedMotion } from "motion/react";
import { MessageSources } from "@/components/chat/message-sources";
import { CitedMarkdown } from "@/components/chat/cited-markdown";
import { MensajeAcciones } from "@/components/chat/mensaje-acciones";
import { ToolSteps } from "@/components/chat/tool-steps";
import { ToolResult } from "@/components/chat/tool-result";
import { ChatThinking } from "@/components/chat/chat-thinking";
import { AccionCard } from "@/components/chat/accion-card";
import type { AccionUI } from "@/lib/chat/types";
import { faseDelMensaje } from "@/lib/chat-fase";
import type { ChatMessage as ChatMessageData } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageData;
  onRetry?: () => void;
  onVote?: (vote: "up" | "down", comentario?: string) => Promise<boolean> | void;
  onConfirmarAccion?: (a: AccionUI) => void;
  onCancelarAccion?: (a: AccionUI) => void;
}

/**
 * Mensaje al estilo de los chats actuales: el usuario en una píldora a la derecha; el asistente sin burbuja,
 * a todo el ancho de la columna, con sus consultas, resultados, fuentes y acciones debajo.
 */
export function ChatMessage({ message, onRetry, onVote, onConfirmarAccion, onCancelarAccion }: ChatMessageProps) {
  const reducir = useReducedMotion();
  const esUsuario = message.role === "user";
  const pasos = message.herramientas ?? [];
  const resultados = pasos.filter((p) => p.presentacion);
  const fase = faseDelMensaje(message);
  const animacion = reducir ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] as const } };

  if (esUsuario) {
    return (
      <motion.div {...animacion} className="flex justify-end">
        <p className="max-w-[85%] rounded-3xl bg-muted px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap">{message.content}</p>
      </motion.div>
    );
  }

  return (
    <motion.div {...animacion} className="space-y-3">
      {pasos.length > 0 && <ToolSteps pasos={pasos} />}
      {fase && <ChatThinking fase={fase} />}
      {message.content && <CitedMarkdown text={message.content} fuentes={message.fuentes} />}
      {resultados.length > 0 && (
        <div className="space-y-2">
          {resultados.map((p) => (
            <ToolResult key={p.id} presentacion={p.presentacion!} />
          ))}
        </div>
      )}
      {message.fuentes && message.fuentes.length > 0 && <MessageSources fuentes={message.fuentes} />}
      {(message.acciones ?? []).map((a) => (
        <AccionCard key={a.id} accion={a} onConfirmar={() => onConfirmarAccion?.(a)} onCancelar={() => onCancelarAccion?.(a)} />
      ))}
      {!message.enCurso && message.content && <MensajeAcciones texto={message.content} onReintentar={onRetry} onVoto={onVote} />}
    </motion.div>
  );
}
