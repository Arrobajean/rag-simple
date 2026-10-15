import { redirect } from "next/navigation";

export const metadata = { title: "Propiedades · Gestión inmobiliaria" };

/**
 * Ruta de cortesía: enlaces antiguos o escritos por el asistente como
 * /dashboard/unidades?referencia=U-00000 se redirigen a la ficha de la propiedad.
 */
export default async function UnidadesPage({ searchParams }: { searchParams: Promise<{ referencia?: string; ref?: string }> }) {
  const { referencia, ref } = await searchParams;
  const r = (ref ?? referencia)?.trim();
  redirect(r ? `/dashboard/propiedades?ref=${encodeURIComponent(r)}` : "/dashboard/propiedades");
}
