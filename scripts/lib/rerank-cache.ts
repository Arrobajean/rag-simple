import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ordenarConModelo } from "../../src/lib/documents/rerank";
import type { FragmentoRecuperado, Reordenar } from "../../src/lib/documents/buscar";

const DIR = join(process.cwd(), "seed-output", "cache");
const FICHERO = join(DIR, "rerank.json");

let cache: Record<string, number[]> | null = null;

function cargar(): Record<string, number[]> {
  if (cache) return cache;
  mkdirSync(DIR, { recursive: true });
  cache = existsSync(FICHERO) ? (JSON.parse(readFileSync(FICHERO, "utf8")) as Record<string, number[]>) : {};
  return cache;
}

/**
 * Reordenador con caché en disco: repetir la evaluación no vuelve a gastar cuota de Gemini.
 * Un fallo no se guarda: en ese caso se mantiene el orden original y se avisa.
 */
export const rerankConCache: Reordenar = async (consulta: string, candidatos: FragmentoRecuperado[]) => {
  const c = cargar();
  const clave = createHash("sha1").update(JSON.stringify([consulta, candidatos.map((f) => f.contenido)])).digest("hex");
  if (c[clave]) return c[clave];
  try {
    const orden = await ordenarConModelo(consulta, candidatos);
    c[clave] = orden;
    writeFileSync(FICHERO, JSON.stringify(c));
    return orden;
  } catch (err) {
    console.warn(`  ⚠ reordenador sin respuesta para «${consulta.slice(0, 40)}…»: ${err instanceof Error ? err.message.slice(0, 120) : err}`);
    return candidatos.map((_, i) => i);
  }
};
