/**
 * Similitud coseno mínima para que un fragmento llegue al asistente. Por debajo, el texto no responde a la
 * pregunta y es mejor decir que no hay información que citar un fragmento irrelevante.
 *
 * Calibrado con `pnpm rag:eval` sobre el seed de pruebas: es el punto medio entre el negativo más alto (~0.59)
 * y el positivo relevante más bajo (~0.71), con los fragmentos ya contextualizados. Los documentos sin reindexar
 * (embeddings anteriores) también quedan bien separados con este valor. Hay que repetir la calibración si cambian
 * el modelo de embeddings, el contexto que se añade a cada fragmento o el corpus.
 */
export const UMBRAL_SIMILITUD = 0.65;
