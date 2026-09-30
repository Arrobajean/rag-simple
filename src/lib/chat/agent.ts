import type { Content, Part } from "@google/genai";
import { chatModel, conModelos, getGeminiClient } from "@/lib/rag";
import type { DataAccess } from "./data";
import { systemPrompt } from "./prompt";
import { declaraciones, describirLlamada, ejecutarHerramienta, type ContextoHerramientas } from "./tools";
import type { ChatEvent, FuenteDocumento, MensajeEntrada, PropuestaAccion } from "./types";

const MAX_ITERACIONES = 6;
const MAX_HISTORIAL = 14;

export interface OpcionesAgente {
  mensajes: MensajeEntrada[];
  data: DataAccess;
  onEvent: (e: ChatEvent) => void;
  signal?: AbortSignal;
  embed?: ContextoHerramientas["embed"];
  hoy?: Date;
  /** Tokens consumidos en cada llamada al modelo (para medir coste). */
  onUso?: (u: { entrada: number; salida: number; razonamiento: number }) => void;
}

/**
 * Bucle del agente: el modelo decide qué herramientas llamar (function calling), el servidor las
 * ejecuta, y el resultado vuelve al modelo hasta que responde con texto. Todo se emite por eventos.
 */
export async function ejecutarAgente({ mensajes, data, onEvent, signal, embed, hoy, onUso }: OpcionesAgente): Promise<string> {
  const client = getGeminiClient();
  const fuentes: FuenteDocumento[] = [];
  const acciones: PropuestaAccion[] = [];
  const ctx: ContextoHerramientas = { data, fuentes, acciones, embed };

  const contents: Content[] = mensajes.slice(-MAX_HISTORIAL).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  let respuesta = "";
  let fuentesEmitidas = 0;
  let accionesEmitidas = 0;

  for (let iter = 0; iter < MAX_ITERACIONES; iter++) {
    if (signal?.aborted) break;

    const stream = await conModelos(chatModel(), (model) =>
      client.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt(hoy),
          tools: [{ functionDeclarations: declaraciones() }],
          temperature: 0.3,
          abortSignal: signal,
        },
      })
    );

    // Partes del turno del modelo, tal cual llegan (conservan firmas de razonamiento de las llamadas)
    const partesModelo: Part[] = [];
    const llamadas: { id: string; name: string; args: unknown }[] = [];

    let uso: { entrada: number; salida: number; razonamiento: number } | null = null;
    for await (const chunk of stream) {
      const m = chunk.usageMetadata;
      if (m) uso = { entrada: m.promptTokenCount ?? 0, salida: m.candidatesTokenCount ?? 0, razonamiento: m.thoughtsTokenCount ?? 0 };
      for (const parte of chunk.candidates?.[0]?.content?.parts ?? []) {
        partesModelo.push(parte);
        if (parte.functionCall?.name) {
          llamadas.push({
            id: parte.functionCall.id ?? `${parte.functionCall.name}-${iter}-${llamadas.length}`,
            name: parte.functionCall.name,
            args: parte.functionCall.args ?? {},
          });
        } else if (parte.text && !parte.thought) {
          respuesta += parte.text;
          onEvent({ type: "text", delta: parte.text });
        }
      }
    }

    if (uso) {
      onUso?.(uso);
      onEvent({ type: "usage", ...uso });
    }
    if (llamadas.length === 0) break;

    contents.push({ role: "model", parts: partesModelo });

    // Las llamadas del mismo turno son independientes: se ejecutan en paralelo
    const respuestas = await Promise.all(
      llamadas.map(async (l) => {
        onEvent({ type: "tool_start", id: l.id, nombre: l.name, descripcion: describirLlamada(l.name, l.args) });
        const r = await ejecutarHerramienta(l.name, l.args, ctx);
        onEvent({ type: "tool_end", id: l.id, ok: r.ok, resumen: r.resumen, presentacion: r.presentacion });
        return { llamada: l, resultado: r };
      })
    );

    if (fuentes.length > fuentesEmitidas) {
      onEvent({ type: "sources", fuentes: fuentes.slice() });
      fuentesEmitidas = fuentes.length;
    }

    for (const a of acciones.slice(accionesEmitidas)) onEvent({ type: "accion", accion: a });
    accionesEmitidas = acciones.length;

    contents.push({
      role: "user",
      parts: respuestas.map(({ llamada, resultado }) => ({
        functionResponse: {
          id: llamada.id,
          name: llamada.name,
          response: resultado.ok ? { output: resultado.resultado } : { error: resultado.resultado },
        },
      })),
    });
  }

  return respuesta;
}
