"use client";

import * as React from "react";
import { toast } from "sonner";
import { ejecutarAccionApi, enviarValoracion, errorMessage, streamChat } from "@/lib/api";
import type { AccionUI, ChatEvent, EjecucionHerramienta } from "@/lib/chat/types";
import { aplicarUso, CONTEXTO_INICIAL, iniciarTurno, type ContextoChat } from "@/lib/chat-contexto";
import type { ChatMessage } from "@/lib/types";

/** Las acciones ya confirmadas se cuentan al modelo en el turno siguiente (no aparecen como texto en pantalla). */
const notasDeAcciones = (m: ChatMessage) =>
  (m.acciones ?? []).filter((a) => a.estado === "hecha").map((a) => `
[Acción confirmada por el usuario: ${a.resultado ?? a.resumen}]`).join("") +
  (m.acciones ?? []).filter((a) => a.estado === "cancelada").map((a) => `
[Acción cancelada por el usuario: ${a.resumen}]`).join("");

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
    case "accion":
      return { ...m, acciones: [...(m.acciones ?? []), { ...e.accion, estado: "pendiente" }] };
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
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [contexto, setContexto] = React.useState<ContextoChat>(CONTEXTO_INICIAL);
  const abortRef = React.useRef<AbortController | null>(null);

  const send = React.useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || loading) return;

      const historial = [...messages.filter((m) => !m.error), nuevo("user", q)];
      const respuesta = nuevo("assistant", "", { enCurso: true, herramientas: [] });
      setMessages((prev) => [...prev, historial[historial.length - 1], respuesta]);
      setLoading(true);
      setContexto((c) => iniciarTurno(c, q));

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await streamChat(
          historial.map((m) => ({ role: m.role, content: m.content + notasDeAcciones(m) })),
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

  const cambiarAccion = React.useCallback((mensajeId: string, accionId: string, cambios: Partial<AccionUI>) => {
    setMessages((prev) => prev.map((m) => (m.id === mensajeId ? { ...m, acciones: (m.acciones ?? []).map((a) => (a.id === accionId ? { ...a, ...cambios } : a)) } : m)));
  }, []);

  /** Ejecuta la acción propuesta tras la confirmación explícita del usuario. */
  const confirmarAccion = React.useCallback(
    async (mensajeId: string, accion: AccionUI) => {
      cambiarAccion(mensajeId, accion.id, { estado: "ejecutando", error: undefined });
      try {
        const r = await ejecutarAccionApi(accion.tipo, accion.datos);
        cambiarAccion(mensajeId, accion.id, { estado: "hecha", resultado: r.resumen });
        toast.success("Hecho", { description: r.resumen });
      } catch (err) {
        cambiarAccion(mensajeId, accion.id, { estado: "error", error: errorMessage(err, "No se pudo ejecutar") });
      }
    },
    [cambiarAccion]
  );

  const cancelarAccion = React.useCallback((mensajeId: string, accion: AccionUI) => cambiarAccion(mensajeId, accion.id, { estado: "cancelada" }), [cambiarAccion]);

  /** Guarda la valoración de una respuesta para que el administrador la vea. */
  const valorar = React.useCallback(
    async (mensajeId: string, voto: "up" | "down", comentario?: string): Promise<boolean> => {
      const idx = messages.findIndex((m) => m.id === mensajeId);
      const m = messages[idx];
      const pregunta = messages.slice(0, idx).findLast((x) => x.role === "user")?.content;
      if (!m || !pregunta) return false;
      try {
        await enviarValoracion({
          voto, pregunta, respuesta: m.content, comentario: comentario?.trim() || undefined, fuentes: m.fuentes?.length ?? 0,
          herramientas: (m.herramientas ?? []).map((h) => ({ nombre: h.nombre, descripcion: h.descripcion, resumen: h.resumen })),
        });
        toast.success(voto === "up" ? "Gracias por tu valoración" : "Gracias: lo revisaremos");
        return true;
      } catch (err) {
        toast.error(errorMessage(err, "No se pudo guardar la valoración"));
        return false;
      }
    },
    [messages]
  );

  const stop = React.useCallback(() => abortRef.current?.abort(), []);

  /** Pregunta del usuario que originó la respuesta en `index`, para reintentar. */
  const questionFor = React.useCallback(
    (index: number) => messages.slice(0, index).findLast((m) => m.role === "user")?.content,
    [messages]
  );

  const clear = React.useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setContexto(CONTEXTO_INICIAL);
  }, []);

  return { messages, loading, contexto, send, stop, questionFor, clear, confirmarAccion, cancelarAccion, valorar };
}
