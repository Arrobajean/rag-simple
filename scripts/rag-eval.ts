// Mide la recuperación de fragmentos de documentos (sin LLM) con el RPC real, sobre el seed de pruebas.
//   pnpm rag:eval
// Calibra el umbral de similitud: por cada pregunta muestra el mejor fragmento relevante y el primero devuelto,
// barre umbrales y, al final, mide lo que recibe el asistente con el umbral de producción.
import type { PGlite } from "@electric-sql/pglite";
import { toVector } from "../src/lib/rag";
import { UMBRAL_SIMILITUD } from "../src/lib/documents/busqueda";
import { buildDataset, TABLAS_EN_ORDEN } from "./seed/dataset";
import { createTestDb } from "./lib/pglite";
import { pgliteData } from "./lib/pglite-data";
import { pgliteRepo } from "./lib/pglite-repo";
import { sqlSink } from "./lib/sinks";
import { embedConCache } from "./lib/embed-cache";
import { rerankConCache } from "./lib/rerank-cache";
import { buscarFragmentos, type Reordenar } from "../src/lib/documents/buscar";
import { generarArchivos, indexarSeed } from "./lib/sembrar-docs";
import { PREGUNTAS, type Pregunta, type Relevante } from "./eval/preguntas-documentos";

try {
  process.loadEnvFile(".env");
} catch {
  // sin .env
}

/** Como la herramienta del asistente: 6 fragmentos por consulta. */
const TOP_K = 6;
/** Candidatos que se piden al RPC para poder barrer umbrales sobre ellos. */
const CANDIDATOS = 40;
const UMBRALES: (number | null)[] = [null, 0.55, 0.58, 0.6, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.7, 0.75];

interface Fila {
  chunk_id: number | bigint;
  documento_id: number | bigint;
  contenido: string;
  similitud: number | null;
}

interface Candidato {
  chunkId: number;
  documentoId: number;
  sim: number;
  simRpc: number | null;
  relevante: boolean;
  contenido: string;
}

interface Resultado {
  p: Pregunta;
  ambito: { p_edificio: number | null; p_unidad: number | null };
  docs: Set<number>;
  candidatos: Candidato[];
}

const coseno = (a: number[], b: number[]) => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

/** Ámbito tal como lo resuelve la herramienta: edificio → p_edificio; contrato → su unidad (p_unidad). */
async function ambitoDe(db: PGlite, ambito: Pregunta["ambito"]) {
  let p_edificio: number | null = null;
  let p_unidad: number | null = null;
  if (ambito?.edificio) {
    const r = await db.query<{ id: number }>("select id from edificios where referencia = $1", [ambito.edificio]);
    if (!r.rows[0]) throw new Error(`Edificio ${ambito.edificio} no existe en el seed`);
    p_edificio = Number(r.rows[0].id);
  }
  if (ambito?.contrato) {
    const r = await db.query<{ unidad_id: number }>("select unidad_id from contratos where referencia = $1", [ambito.contrato]);
    if (!r.rows[0]) throw new Error(`Contrato ${ambito.contrato} no existe en el seed`);
    p_unidad = Number(r.rows[0].unidad_id);
  }
  return { p_edificio, p_unidad };
}

/** Documentos vigentes que cumplen el criterio de tipo, edificio o contrato. */
async function documentosRelevantes(db: PGlite, rel: Relevante): Promise<Set<number>> {
  const condiciones = ["d.estado_indexado = 'indexado'", "d.vigente"];
  const params: unknown[] = [];
  if (rel.tipos?.length) {
    params.push([...rel.tipos]);
    condiciones.push(`d.tipo::text = any($${params.length}::text[])`);
  }
  if (rel.edificio) {
    params.push(rel.edificio);
    condiciones.push(`d.edificio_id = (select id from edificios where referencia = $${params.length})`);
  }
  if (rel.contrato) {
    params.push(rel.contrato);
    condiciones.push(`d.contrato_id = (select id from contratos where referencia = $${params.length})`);
  }
  const r = await db.query<{ id: number }>(`select d.id from documentos d where ${condiciones.join(" and ")}`, params);
  return new Set(r.rows.map((f) => Number(f.id)));
}

/** Similitud coseno calculada aquí para cada candidato, para barrer umbrales sin volver a consultar. */
async function similitudes(db: PGlite, ids: number[], q: number[]) {
  const mapa = new Map<number, number>();
  if (ids.length === 0) return mapa;
  const r = await db.query<{ id: number | bigint; embedding: number[] }>(
    "select id, embedding from document_chunks where id = any($1::bigint[])",
    [ids]
  );
  for (const f of r.rows) mapa.set(Number(f.id), coseno(f.embedding, q));
  return mapa;
}

function evaluar(resultados: Resultado[], umbral: number | null) {
  let pos = 0;
  let aciertos = 0;
  let mrr = 0;
  let neg = 0;
  let falsos = 0;
  let devueltos = 0;
  for (const r of resultados) {
    const lista = r.candidatos.filter((c) => umbral === null || c.sim >= umbral);
    const top = lista.slice(0, TOP_K);
    devueltos += top.length;
    if (r.p.relevante) {
      pos++;
      const idx = lista.findIndex((c) => c.relevante);
      if (idx >= 0 && idx < TOP_K) aciertos++;
      if (idx >= 0) mrr += 1 / (idx + 1);
    } else {
      neg++;
      if (top.length > 0) falsos++;
    }
  }
  return { pos, aciertos, mrr: mrr / Math.max(pos, 1), neg, falsos, devueltos: devueltos / resultados.length };
}

const pct = (n: number, d: number) => `${n}/${d}`.padEnd(8);

async function main() {
  console.log("Preparando base de datos de pruebas y documentos del seed…");
  const ds = buildDataset();
  const db = await createTestDb();
  const sink = sqlSink("t", db, async () => {});
  for (const t of TABLAS_EN_ORDEN) await sink.insert(t, ds.tablas[t]);
  await sink.finalizar();
  const { archivos } = await generarArchivos(ds);
  await indexarSeed(archivos, {
    repo: pgliteRepo(db),
    embed: (t) => embedConCache(t, "RETRIEVAL_DOCUMENT"),
    vincularContrato: async (c, d) => {
      await db.query("update contratos set documento_id = $2 where id = $1", [c, d]);
    },
  });

  const data = pgliteData(db);
  const vectores = await embedConCache(
    PREGUNTAS.map((p) => p.pregunta),
    "RETRIEVAL_QUERY"
  );

  const resultados: Resultado[] = [];
  for (const [i, p] of PREGUNTAS.entries()) {
    const ambito = await ambitoDe(db, p.ambito);
    const docs = p.relevante ? await documentosRelevantes(db, p.relevante) : new Set<number>();
    if (p.relevante && docs.size === 0) console.warn(`  ⚠ ${p.id}: ningún documento del seed cumple el criterio (revisar la pregunta)`);

    const filas = await data.rpc<Fila[]>("rpc_buscar_documentos", {
      query_embedding: toVector(vectores[i]),
      query_text: p.pregunta,
      p_unidad: ambito.p_unidad,
      p_edificio: ambito.p_edificio,
      p_tipos: null,
      p_count: CANDIDATOS,
      p_incluir_no_vigentes: false,
    });
    const sims = await similitudes(db, filas.map((f) => Number(f.chunk_id)), vectores[i]);

    const candidatos: Candidato[] = filas.map((f) => {
      const chunkId = Number(f.chunk_id);
      const documentoId = Number(f.documento_id);
      return {
        chunkId,
        documentoId,
        sim: sims.get(chunkId) ?? NaN,
        simRpc: f.similitud === null ? null : Number(f.similitud),
        relevante: !!p.relevante && docs.has(documentoId) && p.relevante.patron.test(f.contenido),
        contenido: f.contenido,
      };
    });
    resultados.push({ p, ambito, docs, candidatos });
  }

  // Comprobación: la similitud calculada aquí debe coincidir con la que devuelve el RPC
  const conRpc = resultados.flatMap((r) => r.candidatos.filter((c) => c.simRpc !== null));
  const desvio = Math.max(0, ...conRpc.map((c) => Math.abs(c.sim - (c.simRpc as number))));
  console.log(`\nSimilitud calculada vs. RPC: ${conRpc.length} filas comparadas, desvío máximo ${desvio.toExponential(1)}`);

  console.log("\n── Detalle por pregunta (mejor relevante vs. primer resultado) ──────────────────────");
  console.log("id".padEnd(24) + "rank".padEnd(6) + "sim.relevante".padEnd(15) + "sim.1º".padEnd(10) + "devueltos@6  tipo");
  for (const r of resultados) {
    const idx = r.candidatos.findIndex((c) => c.relevante);
    const mejorRel = r.candidatos.filter((c) => c.relevante).reduce<number | null>((m, c) => (m === null || c.sim > m ? c.sim : m), null);
    const primero = r.candidatos[0]?.sim;
    const rank = idx >= 0 ? String(idx + 1) : "—";
    console.log(
      r.p.id.padEnd(24) +
        rank.padEnd(6) +
        (mejorRel === null ? "—" : mejorRel.toFixed(3)).padEnd(15) +
        (primero === undefined ? "—" : primero.toFixed(3)).padEnd(10) +
        `${Math.min(TOP_K, r.candidatos.length)}`.padEnd(13) +
        (r.p.relevante ? "con respuesta" : "sin respuesta")
    );
  }

  console.log("\n── Barrido de umbrales (similitud mínima) ───────────────────────────────────────────");
  console.log("umbral".padEnd(9) + "aciertos@6".padEnd(13) + "MRR".padEnd(8) + "falsos+".padEnd(11) + "fragmentos/consulta");
  for (const u of UMBRALES) {
    const m = evaluar(resultados, u);
    console.log(
      (u === null ? "sin umbral" : u.toFixed(2)).padEnd(9) +
        pct(m.aciertos, m.pos).padEnd(13) +
        m.mrr.toFixed(3).padEnd(8) +
        pct(m.falsos, m.neg).padEnd(11) +
        m.devueltos.toFixed(1)
    );
  }
  console.log(`\n(aciertos@6: preguntas con respuesta y un fragmento relevante entre los ${TOP_K} devueltos. falsos+: preguntas sin respuesta que devuelven algún fragmento.)`);
  console.log("(El barrido filtra la lista de candidatos en TypeScript; el RPC re-rankea después de filtrar. La cifra de producción de abajo es la real.)");

  // Lo que recibe el asistente: la misma función que usa la herramienta, sin reordenar y con el reordenador
  console.log(`
── Producción: buscarFragmentos (umbral ${UMBRAL_SIMILITUD}, ${TOP_K} resultados) ─────────────`);
  const sinReordenar: Reordenar = async (_consulta, candidatos) => candidatos.map((_, i) => i);
  for (const modo of [
    { nombre: "sin reordenar", reordenar: sinReordenar },
    { nombre: "con reordenar", reordenar: rerankConCache },
  ]) {
    let pos = 0;
    let aciertos = 0;
    let neg = 0;
    let falsos = 0;
    let fueraDeUmbral = 0;
    const fallos: string[] = [];
    for (const [i, r] of resultados.entries()) {
      const frags = await buscarFragmentos(
        data,
        async () => vectores[i],
        { consulta: r.p.pregunta, unidadId: r.ambito.p_unidad, edificioId: r.ambito.p_edificio, limite: TOP_K },
        { reordenar: modo.reordenar }
      );
      // Ninguna fila devuelta puede quedar por debajo del umbral
      fueraDeUmbral += frags.filter((f) => f.similitud === null || f.similitud < UMBRAL_SIMILITUD).length;
      const acierto = frags.some((f) => !!r.p.relevante && r.docs.has(f.documento_id) && r.p.relevante.patron.test(f.contenido));
      if (r.p.relevante) {
        pos++;
        if (acierto) aciertos++;
        else fallos.push(r.p.id);
      } else {
        neg++;
        if (frags.length > 0) {
          falsos++;
          fallos.push(`${r.p.id} (falso+)`);
        }
      }
    }
    console.log(`${modo.nombre.padEnd(15)} aciertos@6: ${pct(aciertos, pos).trim().padEnd(8)} falsos+: ${pct(falsos, neg).trim().padEnd(8)} por debajo del umbral: ${fueraDeUmbral}`);
    if (fallos.length) console.log(`  sin acierto o con falso positivo: ${fallos.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
