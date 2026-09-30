import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

export const EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIMS = 768;
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-flash-latest";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada en las variables de entorno");
  }
  return new GoogleGenAI({ apiKey });
}

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL o SUPABASE_KEY no configuradas en las variables de entorno");
  }
  return createClient(url, key);
}

export async function embedTexts(texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"): Promise<number[][]> {
  const gemini = getGeminiClient();
  const batches: string[][] = [];

  for (let i = 0; i < texts.length; i += 100) {
    batches.push(texts.slice(i, i + 100));
  }

  const batchResults = await Promise.all(
    batches.map((chunk) =>
      gemini.models.embedContent({
        model: EMBED_MODEL,
        contents: chunk,
        config: {
          taskType: taskType,
          outputDimensionality: EMBED_DIMS,
        },
      })
    )
  );

  const vectors: number[][] = [];
  for (const res of batchResults) {
    if (res.embeddings) {
      for (const e of res.embeddings) {
        if (e.values) {
          vectors.push(e.values);
        }
      }
    }
  }

  return vectors;
}

export function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    if (end === text.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
}
