// Conjunto de evaluación de la búsqueda en documentos. Los datos salen del seed determinista
// (seed-output/eval/hechos.json), así que cada pregunta tiene un fragmento correcto conocido.
//
// Un fragmento es relevante si pertenece a un documento que cumple `tipos`, `edificio` o `contrato`
// y su texto cumple `patron`. `relevante: null` = no hay nada que responda: lo correcto es no devolver nada.
import type { TipoDocumento } from "../../src/lib/documents/ingest";

export interface Relevante {
  tipos?: readonly TipoDocumento[];
  /** Referencia E-00001 del edificio al que debe pertenecer el documento. */
  edificio?: string;
  /** Referencia C-00001 del contrato al que debe pertenecer el documento. */
  contrato?: string;
  /** El fragmento relevante contiene este texto. */
  patron: RegExp;
}

export interface Pregunta {
  id: string;
  pregunta: string;
  /** Ámbito que pasaría el asistente en la herramienta (buscar_en_documentos). */
  ambito?: { edificio?: string; contrato?: string };
  relevante: Relevante | null;
}

const NORMAS = ["normas_comunidad"] as const;
const LEGAL = ["legal"] as const;
const PROCEDIMIENTO = ["procedimiento_interno"] as const;

export const PREGUNTAS: Pregunta[] = [
  // ── Normas de convivencia por edificio: hay que elegir el edificio correcto ─────────────────────
  // Datos de seed-output/eval/hechos.json (verdad de terreno del seed actual)
  { id: "n-mascotas-prohibidas", pregunta: "¿Se permiten mascotas en Calle de Toledo 45?", ambito: { edificio: "E-00001" }, relevante: { tipos: NORMAS, edificio: "E-00001", patron: /animal|mascota/i } },
  { id: "n-mascotas-libres", pregunta: "¿Se pueden tener perros en Calle de Toledo 47?", ambito: { edificio: "E-00002" }, relevante: { tipos: NORMAS, edificio: "E-00002", patron: /animal|mascota/i } },
  { id: "n-mascotas-limitadas", pregunta: "¿Cuántos animales se pueden tener en Plaza de España 21?", ambito: { edificio: "E-00054" }, relevante: { tipos: NORMAS, edificio: "E-00054", patron: /animal|mascota/i } },
  { id: "n-mascotas-limitadas-3", pregunta: "¿Cuántos animales se pueden tener en Calle de Camarena 64?", ambito: { edificio: "E-00070" }, relevante: { tipos: NORMAS, edificio: "E-00070", patron: /animal|mascota/i } },
  { id: "n-mascotas-prohibidas-2", pregunta: "¿Se pueden tener mascotas en la Avenida de Arcentales 30?", ambito: { edificio: "E-00062" }, relevante: { tipos: NORMAS, edificio: "E-00062", patron: /animal|mascota/i } },
  { id: "n-mascotas-prohibidas-3", pregunta: "¿Se pueden tener perros en Calle de Embajadores 129?", ambito: { edificio: "E-00010" }, relevante: { tipos: NORMAS, edificio: "E-00010", patron: /animal|mascota/i } },
  { id: "n-silencio-goya", pregunta: "¿A qué hora empieza el silencio en Calle de Goya 87?", ambito: { edificio: "E-00037" }, relevante: { tipos: NORMAS, edificio: "E-00037", patron: /silencio/i } },
  { id: "n-silencio-mar-cristal", pregunta: "¿A partir de qué hora hay que guardar silencio en Calle de Mar de Cristal 130?", ambito: { edificio: "E-00103" }, relevante: { tipos: NORMAS, edificio: "E-00103", patron: /silencio/i } },
  { id: "n-obras-agosto", pregunta: "¿Se pueden hacer obras en agosto en Calle de Velázquez 40?", ambito: { edificio: "E-00101" }, relevante: { tipos: NORMAS, edificio: "E-00101", patron: /agosto/i } },
  { id: "n-obras-horario", pregunta: "¿Qué horario tienen las obras en Calle de Velázquez 139?", ambito: { edificio: "E-00091" }, relevante: { tipos: NORMAS, edificio: "E-00091", patron: /obras|lunes/i } },
  { id: "n-turistico-prohibido", pregunta: "¿Se permite el alquiler turístico en Calle de Toledo 47?", ambito: { edificio: "E-00002" }, relevante: { tipos: NORMAS, edificio: "E-00002", patron: /tur[ií]stic/i } },
  { id: "n-turistico-prohibido-2", pregunta: "¿Se puede alquilar un piso para turistas en Calle del Carmen 5?", ambito: { edificio: "E-00026" }, relevante: { tipos: NORMAS, edificio: "E-00026", patron: /tur[ií]stic/i } },
  { id: "n-turistico-autorizado", pregunta: "¿Se permite el alquiler turístico en Calle de Embajadores 129?", ambito: { edificio: "E-00010" }, relevante: { tipos: NORMAS, edificio: "E-00010", patron: /tur[ií]stic/i } },
  // Edificio sin normas en el seed: cualquier fragmento de normas de otro edificio sería un error
  { id: "n-control-sin-normas", pregunta: "¿Se permiten mascotas en el edificio?", ambito: { edificio: "E-00004" }, relevante: null },

  // ── Contratos: fianzas, garantías, gastos y mascotas (algunos son trampas del lector) ───────────
  { id: "k-fianza-trampa", pregunta: "¿De cuánto es la fianza de este contrato?", ambito: { contrato: "C-00573" }, relevante: { contrato: "C-00573", patron: /fianza/i } },
  { id: "k-garantia-trampa", pregunta: "¿Qué garantía adicional exige el arrendador en este contrato?", ambito: { contrato: "C-00315" }, relevante: { contrato: "C-00315", patron: /garant[ií]a adicional/i } },
  { id: "k-gastos-gestion", pregunta: "¿Quién paga los gastos de gestión de este contrato?", ambito: { contrato: "C-00151" }, relevante: { contrato: "C-00151", patron: /gastos de gesti[oó]n/i } },
  { id: "k-mascotas", pregunta: "¿Se permiten mascotas en este contrato?", ambito: { contrato: "C-00004" }, relevante: { contrato: "C-00004", patron: /mascota|animal/i } },
  { id: "k-fianza-normal", pregunta: "¿De cuánto es la fianza de este contrato?", ambito: { contrato: "C-00001" }, relevante: { contrato: "C-00001", patron: /fianza/i } },
  { id: "k-renta", pregunta: "¿Qué renta se pacta en este contrato?", ambito: { contrato: "C-00597" }, relevante: { contrato: "C-00597", patron: /renta/i } },

  // ── Normativa general (sin edificio): la respuesta está en las guías legales y procedimientos ──
  { id: "g-plazo-fianza", pregunta: "¿Cuánto tiempo tiene el arrendador para devolver la fianza?", relevante: { tipos: [...PROCEDIMIENTO, ...LEGAL], patron: /fianza/i } },
  { id: "g-mensualidades-fianza", pregunta: "¿Cuántas mensualidades de fianza puede exigir un arrendador en una vivienda?", relevante: { tipos: LEGAL, patron: /mensualidad de renta/i } },
  { id: "g-garantias-adicionales", pregunta: "¿Qué garantías adicionales se pueden pactar en un alquiler de vivienda?", relevante: { tipos: LEGAL, patron: /garant[ií]as adicionales/i } },
  { id: "g-desistimiento", pregunta: "¿Cuándo puede el inquilino desistir del contrato?", relevante: { tipos: LEGAL, patron: /desistir/i } },
  { id: "g-zona-tensionada", pregunta: "¿Qué es una zona tensionada?", relevante: { tipos: LEGAL, patron: /tensionad/i } },
  { id: "g-gran-tenedor", pregunta: "¿Qué se considera un gran tenedor de vivienda?", relevante: { tipos: LEGAL, patron: /grandes tenedores/i } },
  { id: "g-deposito-fianza", pregunta: "¿Dónde se deposita la fianza en la Comunidad de Madrid?", relevante: { tipos: LEGAL, patron: /dep[oó]sit/i } },
  { id: "g-incidencias-urgentes", pregunta: "¿Cómo se gestionan las incidencias urgentes?", relevante: { tipos: PROCEDIMIENTO, patron: /urgen/i } },
  { id: "g-visita-salida", pregunta: "¿Qué se hace en la visita de salida del inquilino?", relevante: { tipos: PROCEDIMIENTO, patron: /salida/i } },
  { id: "g-validez-certificado", pregunta: "¿Cuánto dura la validez de un certificado energético?", relevante: { tipos: ["certificado_energetico"], patron: /diez años/i } },
  { id: "g-etiqueta-anuncio", pregunta: "¿Es obligatorio incluir la etiqueta energética en un anuncio de alquiler?", relevante: { tipos: ["certificado_energetico"], patron: /etiqueta energ/i } },

  // ── Preguntas fuera del ámbito de los documentos: no debería devolver nada ─────────────────────
  { id: "x-capital-francia", pregunta: "¿Cuál es la capital de Francia?", relevante: null },
  { id: "x-poema", pregunta: "Escribe un poema sobre el mar", relevante: null },
  { id: "x-paella", pregunta: "¿Cómo se prepara una paella valenciana?", relevante: null },
  { id: "x-tiempo", pregunta: "¿Qué tiempo hará mañana en Madrid?", relevante: null },
  { id: "x-mundial", pregunta: "¿Quién ganó el Mundial de fútbol de 2018?", relevante: null },
  { id: "x-tren", pregunta: "¿Cuánto cuesta un billete de tren a Barcelona?", relevante: null },
];
