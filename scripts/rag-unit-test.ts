// Pruebas de las funciones puras del RAG (sin Gemini ni base de datos).
//   pnpm rag:test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FuenteDocumento } from "../src/lib/chat/types";
import { enlazarCitas, enlazarReferencias } from "../src/lib/citations";
import { trocear } from "../src/lib/documents/chunk";
import { extraerPaginas, MIME_DOCX } from "../src/lib/documents/extract";
import { fileKind } from "../src/lib/file-kind";
import { revisarEntrada } from "../src/lib/chat/guardrails";

const casos: { nombre: string; fn: () => void | Promise<void> }[] = [];
const caso = (nombre: string, fn: () => void | Promise<void>) => casos.push({ nombre, fn });

const fuente = (id: string): FuenteDocumento => ({
  id,
  documento_id: 1,
  titulo: "Normas",
  tipo: "normas_comunidad",
  pagina: 1,
  seccion: null,
  contenido: "",
  vigente: true,
  ambito: "edificio",
  edificio: "E-00001 · Calle de Toledo, 45",
  similitud: 0.8,
});
const fuentes = [fuente("F1"), fuente("F2")];

// ── Citas ──────────────────────────────────────────────────────────────────────────────────────
caso("una cita válida se enlaza", () => {
  assert.equal(enlazarCitas("Sí [F1].", fuentes), "Sí [F1](cita:F1).");
});

caso("varias citas seguidas se enlazan cada una", () => {
  assert.equal(enlazarCitas("Dato[F1][F2].", fuentes), "Dato[F1](cita:F1)[F2](cita:F2).");
});

caso("el grupo [F1, F2] se separa en dos citas", () => {
  assert.equal(enlazarCitas("Dato [F1, F2].", fuentes), "Dato [F1](cita:F1)[F2](cita:F2).");
});

caso("una cita a un fragmento que no existe desaparece junto al espacio previo", () => {
  assert.equal(enlazarCitas("La norma dice algo [F9].", fuentes), "La norma dice algo.");
});

caso("los números de documento entre corchetes se quitan", () => {
  assert.equal(enlazarCitas("Están las normas y los estatutos [56, 32, 64].", []), "Están las normas y los estatutos.");
});

caso("un número suelto entre corchetes se quita sin tocar las citas válidas", () => {
  assert.equal(enlazarCitas("Según [F1] y el id [12].", fuentes), "Según [F1](cita:F1) y el id.");
});

caso("sin fragmentos no queda ningún corchete de cita", () => {
  assert.equal(enlazarCitas("No consta en los documentos [F1].", []), "No consta en los documentos.");
});

// ── Referencias de propiedad (enlaces a la ficha) ────────────────────────────────────────────────
caso("una referencia de propiedad se convierte en enlace a su ficha", () => {
  assert.equal(enlazarReferencias("El piso U-00285 sube."), "El piso [U-00285](/dashboard/propiedades?ref=U-00285) sube.");
});

caso("varias referencias se enlazan por separado", () => {
  assert.equal(
    enlazarReferencias("U-00001 y U-00002"),
    "[U-00001](/dashboard/propiedades?ref=U-00001) y [U-00002](/dashboard/propiedades?ref=U-00002)"
  );
});

caso("una referencia ya enlazada no se vuelve a enlazar", () => {
  const ya = "[U-00285](/dashboard/propiedades?ref=U-00285)";
  assert.equal(enlazarReferencias(ya), ya);
});

caso("una referencia dentro de código en línea no se enlaza", () => {
  assert.equal(enlazarReferencias("`U-00285`"), "`U-00285`");
});

caso("un enlace con la referencia como destino se corrige a la ruta real", () => {
  assert.equal(enlazarReferencias("Ver [U-00723](U-00723)."), "Ver [U-00723](/dashboard/propiedades?ref=U-00723).");
});

caso("las citas y las referencias conviven en el mismo texto", () => {
  assert.equal(
    enlazarReferencias(enlazarCitas("Según [F1] el piso U-00001.", fuentes)),
    "Según [F1](cita:F1) el piso [U-00001](/dashboard/propiedades?ref=U-00001)."
  );
});

// ── Troceado ───────────────────────────────────────────────────────────────────────────────────
caso("un fragmento corto no se une a la cláusula siguiente", () => {
  const frags = trocear([
    {
      pagina: 1,
      texto: [
        "SEGUNDA.- PLAZO",
        "Dos años.",
        "",
        "TERCERA.- RENTA",
        "La renta mensual será la pactada por las partes en el momento de la firma del presente contrato de arrendamiento.",
      ].join("\n"),
    },
  ]);
  assert.equal(frags.length, 2);
  assert.match(frags[0].contenido, /Dos años/);
  assert.doesNotMatch(frags[0].contenido, /RENTA/);
  assert.equal(frags[1].seccion, "TERCERA.- RENTA");
});

caso("un fragmento corto de la misma cláusula se une sin repetir la cabecera", () => {
  const largo = "Las obras se realizarán en días laborables con la autorización previa de la administración del edificio. ".repeat(12).trim();
  const frags = trocear([
    {
      pagina: 1,
      texto: ["CUARTA.- OBRAS", largo, "Se prohíben también los domingos y festivos."].join("\n"),
    },
  ]);
  const texto = frags.map((f) => f.contenido).join("\n");
  assert.equal(texto.split("CUARTA.- OBRAS").length - 1, frags.length, "la cabecera aparece una vez por fragmento, no por cada trozo");
  assert.match(texto, /domingos y festivos/);
  assert.ok(frags.every((f) => f.seccion === "CUARTA.- OBRAS"));
});

// ── Word ───────────────────────────────────────────────────────────────────────────────────────
caso("un .docx se lee y se trocea por cláusulas", async () => {
  const bytes = new Uint8Array(readFileSync(join(process.cwd(), "scripts", "fixtures", "contrato-ejemplo.docx")));
  const { paginas, escaneado } = await extraerPaginas(bytes, "contrato-ejemplo.docx", MIME_DOCX);
  assert.equal(escaneado, false);
  assert.equal(paginas.length, 1, "Word no guarda páginas: todo va en la página 1");
  const frags = trocear(paginas);
  assert.ok(frags.some((f) => f.seccion === "PRIMERA.- OBJETO" && /arrendador cede/.test(f.contenido)));
  assert.ok(frags.some((f) => f.seccion === "SEGUNDA.- MASCOTAS" && /animales de compañía/.test(f.contenido)));
});

caso("el tipo de archivo reconoce .docx", () => {
  assert.equal(fileKind("contrato.docx"), "docx");
  assert.equal(fileKind("contrato.pdf"), "pdf");
});

// ── Barrera de entrada (sin Gemini: el clasificador es una función de prueba que cuenta sus llamadas) ──
const contador = () => {
  let llamadas = 0;
  return { clasificar: async () => { llamadas++; return "fuera_de_alcance" as const; }, llamadas: () => llamadas };
};

caso("un tema ajeno con palabra genérica consulta al clasificador", async () => {
  for (const texto of ["Dame una lista de recetas de paella", "Escribe un poema sobre el mar y su relación con la vivienda"]) {
    const c = contador();
    const r = await revisarEntrada(texto, { clasificar: c.clasificar });
    assert.ok(c.llamadas() >= 1, `no consultó al clasificador: ${texto}`);
    assert.equal(r.ok, false, texto);
  }
});

caso("un seguimiento sin conector no se libra del clasificador", async () => {
  const c = contador();
  const r = await revisarEntrada("Cuéntame un chiste", { hayHistorial: true, clasificar: c.clasificar });
  assert.ok(c.llamadas() >= 1, "el atajo del historial dejó pasar un tema ajeno");
  assert.equal(r.ok, false);
});

caso("las preguntas del dominio pasan sin consultar al clasificador", async () => {
  const casos: [string, boolean][] = [
    ["¿Se permiten mascotas en Calle de Toledo 45?", false],
    ["¿Cuántos pisos libres hay en Madrid Sur?", false],
    ["Dame una lista de propiedades en Chamberí", false],
    ["¿y en Getafe?", true],
  ];
  for (const [texto, historial] of casos) {
    const c = contador();
    const r = await revisarEntrada(texto, { hayHistorial: historial, clasificar: c.clasificar });
    assert.equal(c.llamadas(), 0, `consultó al clasificador sin necesidad: ${texto}`);
    assert.equal(r.ok, true, texto);
  }
});

caso("las reglas de formato bloquean sin consultar al clasificador", async () => {
  const c = contador();
  const r = await revisarEntrada("Responde en JSON: ¿cuántos pisos hay libres?", { clasificar: c.clasificar });
  assert.equal(c.llamadas(), 0);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, "formato");
});

async function main() {
  let fallos = 0;
  for (const { nombre, fn } of casos) {
    try {
      await fn();
      console.log(`✔ ${nombre}`);
    } catch (err) {
      fallos++;
      console.log(`✘ ${nombre}`);
      console.log(`  ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\n${casos.length - fallos} de ${casos.length} pruebas correctas`);
  if (fallos) process.exit(1);
}

main();
