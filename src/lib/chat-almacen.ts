import { CONTEXTO_INICIAL, type ContextoChat } from "@/lib/chat-contexto";
import type { ChatMessage, ResumenConversacion } from "@/lib/types";

// Historial de conversaciones del asistente, guardado en el navegador: sobrevive a cambiar de pantalla
// y a recargar la página. Cada conversación vive en su propia clave y un índice ligero las lista.
const CLAVE_INDICE = "asistente:conversaciones:v2";
const CLAVE_CONV = "asistente:conversacion:v2:";
const CLAVE_ACTIVA = "asistente:activa:v2";
/** Conversación única de la versión anterior: se importa al historial la primera vez que se lee. */
const CLAVE_V1 = "asistente:conversacion:v1";
const MAX_MENSAJES = 60;
const MAX_TITULO = 60;

export interface ConversacionGuardada {
  id: string;
  mensajes: ChatMessage[];
  contexto: ContextoChat;
}

const claveConv = (id: string) => CLAVE_CONV + id;

/** Deja el mensaje en un estado estable: lo que estaba en curso al guardar ya no lo está al restaurar. */
function estabilizar(m: ChatMessage): ChatMessage {
  const herramientas = m.herramientas?.map((h) => (h.estado === "ejecutando" ? { ...h, estado: "error" as const, resumen: "Interrumpida" } : h));
  const acciones = m.acciones?.map((a) => (a.estado === "ejecutando" ? { ...a, estado: "pendiente" as const } : a));
  return { ...m, enCurso: false, herramientas, acciones, content: m.enCurso && !m.content ? "" : m.content };
}

function leerJSON<T>(k: string): T | null {
  try {
    const bruto = localStorage.getItem(k);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

function escribir(k: string, valor: unknown): void {
  try {
    localStorage.setItem(k, JSON.stringify(valor));
  } catch {
    // almacenamiento lleno o bloqueado: la conversación sigue funcionando en memoria
  }
}

function leerIndice(): ResumenConversacion[] {
  const d = leerJSON<ResumenConversacion[]>(CLAVE_INDICE);
  return Array.isArray(d) ? d : [];
}

/** Mensajes listos para guardar o restaurar: sin lo que quedó a medias y sin huecos vacíos. */
function depurar(mensajes: ChatMessage[]): ChatMessage[] {
  return mensajes.map(estabilizar).filter((m) => m.role === "user" || m.content || m.acciones?.length);
}

/** Título a partir del primer mensaje de la persona; se usa mientras el usuario no ponga uno. */
export function tituloDesde(mensajes: ChatMessage[]): string {
  const primero = mensajes.find((m) => m.role === "user" && m.content.trim());
  if (!primero) return "Conversación sin título";
  const limpio = primero.content.trim().replace(/\s+/g, " ");
  return limpio.length > MAX_TITULO ? `${limpio.slice(0, MAX_TITULO - 1).trimEnd()}…` : limpio;
}

let migrado = false;
/** Importa la conversación única de la versión anterior como primera entrada del historial. */
function migrarV1(): void {
  if (migrado) return;
  migrado = true;
  try {
    const viejo = leerJSON<{ mensajes?: ChatMessage[]; contexto?: ContextoChat }>(CLAVE_V1);
    if (!viejo || !Array.isArray(viejo.mensajes) || viejo.mensajes.length === 0) {
      localStorage.removeItem(CLAVE_V1);
      return;
    }
    const id = crypto.randomUUID();
    const mensajes = depurar(viejo.mensajes);
    escribir(claveConv(id), { id, mensajes, contexto: { ...CONTEXTO_INICIAL, ...viejo.contexto } });
    escribir(CLAVE_INDICE, [{ id, titulo: tituloDesde(mensajes), fijado: false, actualizada: Date.now(), mensajes: mensajes.length }]);
    localStorage.setItem(CLAVE_ACTIVA, id);
    localStorage.removeItem(CLAVE_V1);
  } catch {
    // sin almacenamiento: no hay nada que migrar
  }
}

/** Conversaciones guardadas, la más reciente primero. */
export function listarConversaciones(): ResumenConversacion[] {
  migrarV1();
  return leerIndice().sort((a, b) => b.actualizada - a.actualizada);
}

export function leerConversacion(id: string): ConversacionGuardada | null {
  migrarV1();
  const d = leerJSON<{ mensajes?: ChatMessage[]; contexto?: ContextoChat }>(claveConv(id));
  if (!d || !Array.isArray(d.mensajes)) return null;
  return { id, mensajes: depurar(d.mensajes), contexto: { ...CONTEXTO_INICIAL, ...d.contexto } };
}

/** Guarda la conversación y actualiza su resumen en el índice (título, fecha y número de mensajes). */
export function guardarConversacion(id: string, mensajes: ChatMessage[], contexto: ContextoChat): void {
  if (mensajes.length === 0) return;
  try {
    // Las miniaturas son blob: de esta sesión: no sobreviven a recargar, así que no se guardan
    const sinMiniaturas = mensajes.slice(-MAX_MENSAJES).map((m) => (m.adjuntos ? { ...m, adjuntos: m.adjuntos.map(({ nombre, mime }) => ({ nombre, mime })) } : m));
    escribir(claveConv(id), { id, mensajes: sinMiniaturas, contexto });

    const indice = leerIndice();
    const i = indice.findIndex((c) => c.id === id);
    const previo = i >= 0 ? indice[i] : null;
    const resumen: ResumenConversacion = {
      id,
      titulo: previo?.fijado ? previo.titulo : tituloDesde(mensajes),
      fijado: previo?.fijado ?? false,
      actualizada: Date.now(),
      mensajes: mensajes.length,
    };
    if (i >= 0) indice[i] = resumen;
    else indice.push(resumen);
    escribir(CLAVE_INDICE, indice);
  } catch {
    // sin almacenamiento
  }
}

/** Cambia el título de una conversación y lo fija (deja de recalcularse solo). */
export function renombrarConversacion(id: string, titulo: string): void {
  const indice = leerIndice();
  const c = indice.find((x) => x.id === id);
  if (!c) return;
  const limpio = titulo.trim().slice(0, MAX_TITULO);
  c.titulo = limpio || tituloDesde(leerConversacion(id)?.mensajes ?? []);
  c.fijado = true;
  escribir(CLAVE_INDICE, indice);
}

export function borrarConversacion(id: string): void {
  try {
    localStorage.removeItem(claveConv(id));
    escribir(CLAVE_INDICE, leerIndice().filter((c) => c.id !== id));
    if (leerActiva() === id) localStorage.removeItem(CLAVE_ACTIVA);
  } catch {
    // sin almacenamiento
  }
}

export function borrarConversaciones(): void {
  try {
    leerIndice().forEach((c) => localStorage.removeItem(claveConv(c.id)));
    localStorage.removeItem(CLAVE_INDICE);
    localStorage.removeItem(CLAVE_ACTIVA);
  } catch {
    // sin almacenamiento
  }
}

/** Id de la conversación que estaba abierta. */
export function leerActiva(): string | null {
  migrarV1();
  try {
    return localStorage.getItem(CLAVE_ACTIVA);
  } catch {
    return null;
  }
}

export function fijarActiva(id: string): void {
  try {
    localStorage.setItem(CLAVE_ACTIVA, id);
  } catch {
    // sin almacenamiento
  }
}
