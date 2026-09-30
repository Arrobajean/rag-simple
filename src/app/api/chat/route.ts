import { NextResponse } from "next/server";
import { CHAT_MODEL, embedTexts, getGeminiClient, getSupabaseClient } from "@/lib/rag";

const SYSTEM_PROMPT = `Responde en español usando SOLO el contexto proporcionado.
Si la respuesta no está en el contexto, dilo claramente.
Cita la fuente entre corchetes, por ejemplo [archivo.md].`;

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Pregunta no proporcionada" }, { status: 400 });
    }

    const [queryVec] = await embedTexts([question], "RETRIEVAL_QUERY");
    if (!queryVec) {
      return NextResponse.json({ error: "No se pudo generar embedding para la pregunta" }, { status: 500 });
    }

    const supabase = getSupabaseClient();
    const { data: matches, error: rpcError } = await supabase.rpc("match_documents", {
      query_embedding: queryVec,
      match_count: 5,
    });

    if (rpcError) {
      console.error("Error en match_documents:", rpcError);
      return NextResponse.json({ error: `Error en base de datos: ${rpcError.message}` }, { status: 500 });
    }

    interface MatchItem {
      id: number;
      source: string;
      content: string;
      similarity: number;
    }

    const formattedMatches: MatchItem[] = ((matches as Array<{ id: number; source: string; content: string; similarity: number }>) || []).map((m) => ({
      id: m.id,
      source: m.source,
      content: m.content,
      similarity: Number((m.similarity ?? 0).toFixed(4)),
    }));

    const context = formattedMatches.map((m) => `[${m.source}]\n${m.content}`).join("\n\n");

    const gemini = getGeminiClient();

    let answer = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const resp = await gemini.models.generateContent({
          model: CHAT_MODEL,
          contents: `Contexto:\n${context}\n\nPregunta: ${question}`,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });
        answer = resp.text || "No se obtuvo respuesta del modelo.";
        break;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes("503") && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json({
      answer,
      matches: formattedMatches,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error procesando la consulta";
    console.error("Error en /api/chat:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
