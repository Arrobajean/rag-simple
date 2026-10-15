import { z } from "zod";
import { manejar } from "@/lib/api-server";
import { accesoAbierto, exigirAdmin, sesionDe } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/rag";

const Cuerpo = z.object({
  tipo: z.enum(["soporte", "feedback"]),
  mensaje: z.string().trim().min(5).max(4000),
  email: z.string().trim().max(160).optional(),
});

/** Email del formulario solo si tiene forma válida (nunca se guarda texto suelto). */
function emailDeFormulario(email: string | undefined): string | null {
  const e = email?.trim().toLowerCase();
  return e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
}

/** Cualquier usuario con sesión puede dejar un mensaje de soporte o feedback. */
export async function POST(req: Request) {
  return manejar(async () => {
    const c = Cuerpo.parse(await req.json());
    const sesion = accesoAbierto() ? null : await sesionDe(req);
    const { data, error } = await getSupabaseClient()
      .from("soporte")
      .insert({
        tipo: c.tipo,
        mensaje: c.mensaje,
        email: sesion?.email?.toLowerCase() ?? emailDeFormulario(c.email),
        nombre: sesion?.nombre ?? null,
        rol: sesion?.rol ?? null,
        user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as number };
  }, "No se pudo enviar el mensaje");
}

const TAM = 25;

/** Mensajes de soporte y feedback: solo administradores. */
export async function GET(req: Request) {
  const denegado = await exigirAdmin(req);
  if (denegado) return denegado;
  return manejar(async () => {
    const p = new URL(req.url).searchParams;
    const tipo = p.get("tipo");
    const pagina = Math.max(Number(p.get("pagina")) || 1, 1);
    const sb = getSupabaseClient();
    const desde24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const base = () => sb.from("soporte").select("id", { count: "exact", head: true });
    const cuenta = async (filtro?: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
      const { count, error } = await (filtro ? filtro(base()) : base());
      if (error) throw new Error(error.message);
      return count ?? 0;
    };

    let lista = sb.from("soporte").select("*", { count: "exact" }).order("created_at", { ascending: false }).range((pagina - 1) * TAM, pagina * TAM - 1);
    if (tipo === "soporte" || tipo === "feedback") lista = lista.eq("tipo", tipo);

    const [total, soporte, feedback, nuevos, ultimas24h, items] = await Promise.all([
      cuenta(),
      cuenta((q) => q.eq("tipo", "soporte")),
      cuenta((q) => q.eq("tipo", "feedback")),
      cuenta((q) => q.eq("estado", "nuevo")),
      cuenta((q) => q.gte("created_at", desde24h)),
      lista,
    ]);
    if (items.error) throw new Error(items.error.message);
    return {
      resumen: { total, soporte, feedback, nuevos, ultimas24h },
      items: items.data ?? [],
      total: items.count ?? 0,
    };
  }, "No se pudieron leer los mensajes");
}

const Cambio = z.object({ id: z.number().int().positive(), estado: z.enum(["nuevo", "revisado"]) });

/** Marca un mensaje como revisado (o nuevo). Solo administradores. */
export async function PATCH(req: Request) {
  const denegado = await exigirAdmin(req);
  if (denegado) return denegado;
  return manejar(async () => {
    const c = Cambio.parse(await req.json());
    const { error } = await getSupabaseClient().from("soporte").update({ estado: c.estado }).eq("id", c.id);
    if (error) throw new Error(error.message);
    return { success: true };
  }, "No se pudo actualizar el mensaje");
}
