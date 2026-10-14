// Reindexa los documentos de producción con el pipeline actual (contexto en los fragmentos y troceado nuevo).
// Hace falta tras aplicar la migración 0017: los fragmentos anteriores no tienen contexto.
//   pnpm documentos:reindexar -- --dry-run   → solo lista lo que se reindexaría
//   pnpm documentos:reindexar                → reindexa (lee cada archivo de Storage; los escaneos vuelven a pasar por OCR)
import { getSupabaseClient } from "../src/lib/rag";
import { indexarDocumento } from "../src/lib/documents/ingest";

try {
  process.loadEnvFile(".env");
} catch {
  // sin .env
}

interface Fila {
  id: number;
  titulo: string;
  storage_path: string | null;
  mime: string | null;
}

async function main() {
  const soloListar = process.argv.includes("--dry-run");
  const { data, error } = await getSupabaseClient()
    .from("documentos")
    .select("id, titulo, storage_path, mime")
    .eq("estado_indexado", "indexado")
    .order("id");
  if (error) throw new Error(error.message);
  const documentos = (data ?? []) as Fila[];

  const conArchivo = documentos.filter((d) => d.storage_path);
  const sinArchivo = documentos.filter((d) => !d.storage_path);
  console.log(`${documentos.length} documentos indexados: ${conArchivo.length} con archivo, ${sinArchivo.length} sin archivo.`);
  for (const d of sinArchivo) {
    console.log(`  · sin archivo (no se puede reindexar, hay que volver a pegar su texto): #${d.id} ${d.titulo}`);
  }
  if (soloListar) {
    for (const d of conArchivo) console.log(`  · #${d.id} ${d.titulo}`);
    return;
  }

  let ok = 0;
  const fallos: string[] = [];
  for (const [i, d] of conArchivo.entries()) {
    process.stdout.write(`[${i + 1}/${conArchivo.length}] #${d.id} ${d.titulo.slice(0, 70)} … `);
    try {
      const r = await indexarDocumento(d.id);
      ok++;
      console.log(`${r.fragmentos} fragmentos${r.ocr ? " (OCR)" : ""}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      fallos.push(`#${d.id}: ${msg}`);
      console.log(`ERROR ${msg.slice(0, 120)}`);
    }
  }
  console.log(`\nReindexados: ${ok}. Con error: ${fallos.length}.`);
  for (const f of fallos) console.log(`  · ${f}`);
  if (fallos.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
