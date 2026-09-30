// Tipos compartidos entre el servidor (agente) y el navegador (hook del chat).

export interface FuenteDocumento {
  /** Identificador corto que el modelo cita en la respuesta: F1, F2… */
  id: string;
  documento_id: number;
  titulo: string;
  tipo: string;
  pagina: number | null;
  seccion: string | null;
  contenido: string;
  vigente: boolean;
  ambito: string;
  similitud: number | null;
}

/** Cómo mostrar el resultado de una herramienta bajo el mensaje. */
export type Presentacion =
  | {
      tipo: "tabla";
      titulo: string;
      columnas: { clave: string; etiqueta: string; formato?: "moneda" | "fecha" | "numero" | "texto" }[];
      filas: Record<string, unknown>[];
      total?: number;
    }
  | { tipo: "barras"; titulo: string; etiquetaValor: string; datos: { etiqueta: string; valor: number }[] };

export interface EjecucionHerramienta {
  id: string;
  nombre: string;
  /** Texto corto de lo consultado: "Contar propiedades · zona=Madrid Sur, estado=disponible". */
  descripcion: string;
  estado: "ejecutando" | "hecha" | "error";
  resumen?: string;
  presentacion?: Presentacion;
}

export type ChatEvent =
  | { type: "tool_start"; id: string; nombre: string; descripcion: string }
  | { type: "tool_end"; id: string; ok: boolean; resumen: string; presentacion?: Presentacion }
  | { type: "sources"; fuentes: FuenteDocumento[] }
  /** Tokens de una llamada al modelo: `entrada` es todo el contexto enviado en esa llamada. */
  | { type: "usage"; entrada: number; salida: number; razonamiento: number }
  | { type: "text"; delta: string }
  | { type: "done" }
  | { type: "error"; message: string; status?: number };

export interface MensajeEntrada {
  role: "user" | "assistant";
  content: string;
}

/** Tamaño de la ventana de contexto del modelo (Gemini Flash-Lite: ~1 M de tokens de entrada). */
export const VENTANA_CONTEXTO = 1_048_576;
