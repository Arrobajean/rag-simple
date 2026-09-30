import { describeError } from "@/lib/rag";
import { ejecutarAgente } from "@/lib/chat/agent";
import { supabaseData } from "@/lib/chat/data";
import type { ChatEvent, MensajeEntrada } from "@/lib/chat/types";

export const maxDuration = 120;

function mensajesDe(body: unknown): MensajeEntrada[] | null {
  const b = body as { messages?: unknown; question?: unknown };
  if (Array.isArray(b?.messages)) {
    const valid = b.messages.filter(
      (m): m is MensajeEntrada =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim() !== ""
    );
    return valid.length && valid[valid.length - 1].role === "user" ? valid : null;
  }
  if (typeof b?.question === "string" && b.question.trim()) return [{ role: "user", content: b.question }];
  return null;
}

/** Respuesta en NDJSON: un evento JSON por línea (texto, herramientas usadas, fuentes…). */
export async function POST(req: Request) {
  const mensajes = mensajesDe(await req.json().catch(() => null));
  if (!mensajes) {
    return Response.json({ error: "Envía al menos un mensaje del usuario" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      try {
        await ejecutarAgente({ mensajes, data: supabaseData(), onEvent: emit, signal: req.signal });
        emit({ type: "done" });
      } catch (error: unknown) {
        console.error("Error en /api/chat:", error);
        const { message, status } = describeError(error, "Error procesando la consulta");
        emit({ type: "error", message, status });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
