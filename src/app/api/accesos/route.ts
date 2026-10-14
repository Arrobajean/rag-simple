import { manejar } from "@/lib/api-server";
import { exigirAdmin } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/rag";

const TAM = 25;

/** Registro de accesos: quién entra, con qué rol, método y dispositivo. Solo administradores. */
export async function GET(req: Request) {
  const denegado = await exigirAdmin(req);
  if (denegado) return denegado;
  return manejar(async () => {
    const p = new URL(req.url).searchParams;
    const metodo = p.get("metodo");
    const pagina = Math.max(Number(p.get("pagina")) || 1, 1);
    const sb = getSupabaseClient();
    const desde24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let lista = sb.from("accesos").select("*", { count: "exact" }).order("created_at", { ascending: false }).range((pagina - 1) * TAM, pagina * TAM - 1);
    if (metodo === "linkedin" || metodo === "contrasena") lista = lista.eq("metodo", metodo);

    const [total, ultimas24h, items] = await Promise.all([
      sb.from("accesos").select("id", { count: "exact", head: true }),
      sb.from("accesos").select("id", { count: "exact", head: true }).gte("created_at", desde24h),
      lista,
    ]);
    if (items.error) throw new Error(items.error.message);
    return {
      resumen: { total: total.count ?? 0, ultimas24h: ultimas24h.count ?? 0 },
      items: items.data ?? [],
      total: items.count ?? 0,
    };
  }, "No se pudieron leer los accesos");
}
