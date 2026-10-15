/** "attr_permite_mascotas" → "Permite mascotas". */
export function etiquetaAtributo(clave: string): string {
  const limpio = clave.replace(/^attr_/, "").replace(/_/g, " ").trim();
  return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : clave;
}

/** Valor de un atributo del catálogo en texto legible. */
export function valorAtributo(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
}
