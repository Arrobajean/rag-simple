"use client";

import * as React from "react";
import { toast } from "sonner";
import { errorMessage, streamChat } from "@/lib/api";
import type { ChatEvent, EjecucionHerramienta } from "@/lib/chat/types";
import { aplicarUso, CONTEXTO_INICIAL, iniciarTurno, type ContextoChat } from "@/lib/chat-contexto";
import type { ChatMessage } from "@/lib/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hola, soy tu asistente de gestión inmobiliaria. Puedo **contar y filtrar propiedades**, consultar contratos, cobros y alertas, y **leer los documentos** (contratos, normas de comunidad, actas). Los números salen siempre de la base de datos.",
  timestamp: "Ahora",
};

const hora = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function nuevo(role: ChatMessage["role"], content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: crypto.randomUUID(), role, content, timestamp: hora(), ...extra };
}

/** Aplica un evento del servidor al mensaje del asistente que se está construyendo. */
function aplicar(m: ChatMessage, e: ChatEvent): ChatMessage {
  switch (e.type) {
    case "text":
      return { ...m, content: m.content + e.delta };
    case "tool_start": {
      const paso: EjecucionHerramienta = { id: e.id, nombre: e.nombre, descripcion: e.descripcion, estado: "ejecutando" };
      return { ...m, herramientas: [...(m.herramientas ?? []), paso] };
    }
    case "tool_end":
      return {
        ...m,
        herramientas: (m.herramientas ?? []).map((h) =>
          h.id === e.id ? { ...h, estado: e.ok ? "hecha" : "error", resumen: e.resumen, presentacion: e.presentacion } : h
        ),
      };
    case "usage":
      return m; // el uso de tokens se contabiliza aparte (contexto)
    case "sources":
      return { ...m, fuentes: e.fuentes };
    case "error":
      return { ...m, error: true, content: m.content || `No he podido completar la consulta: ${e.message}` };
    case "done":
      return { ...m, enCurso: false };
  }
}

export function useRagChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME]);
  const [loading, setLoading] = React.useState(false);
  const [contexto, setContexto] = React.useState<ContextoChat>(CONTEXTO_INICIAL);
  const abortRef = React.useRef<AbortController | null>(null);

  const send = React.useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || loading) return;

      const historial = [...messages.filter((m) => m.id !== "welcome" && !m.error), nuevo("user", q)];
      const respuesta = nuevo("assistant", "", { enCurso: true, herramientas: [] });
      setMessages((prev) => [...prev, historial[historial.length - 1], respuesta]);
      setLoading(true);
      setContexto((c) => iniciarTurno(c, q));

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await streamChat(
          historial.map((m) => ({ role: m.role, content: m.content })),
          (e) => {
            if (e.type === "usage") setContexto((c) => aplicarUso(c, e));
            setMessages((prev) => prev.map((m) => (m.id === respuesta.id ? aplicar(m, e) : m)));
          },
          controller.signal
        );
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          const message = errorMessage(err, "Error inesperado");
          toast.error(message);
          setMessages((prev) => prev.map((m) => (m.id === respuesta.id ? aplicar(m, { type: "error", message }) : m)));
        }
      } finally {
        setMessages((prev) => prev.map((m) => (m.id === respuesta.id ? { ...m, enCurso: false } : m)));
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, messages]
  );

  const stop = React.useCallback(() => abortRef.current?.abort(), []);

  /** Pregunta del usuario que originó la respuesta en `index`, para reintentar. */
  const questionFor = React.useCallback(
    (index: number) => messages.slice(0, index).findLast((m) => m.role === "user")?.content,
    [messages]
  );

  const clear = React.useCallback(() => {
    abortRef.current?.abort();
    setMessages([{ ...WELCOME, content: "Conversación reiniciada. ¿En qué puedo ayudarte?" }]);
    setContexto(CONTEXTO_INICIAL);
    toast.success("Conversación reiniciada");
  }, []);

  return { messages, loading, contexto, send, stop, questionFor, clear };
}
