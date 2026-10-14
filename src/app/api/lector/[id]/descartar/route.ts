import { supabaseDb } from "@/lib/db";
import { descartarExtraccion } from "@/lib/lector/servicio";
import { idDe, manejar } from "@/lib/api-server";
import { exigirEscritura, sesionDe } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denegado = await exigirEscritura(req);
  if (denegado) return denegado;
  return manejar(async () => {
    await descartarExtraccion(supabaseDb(), idDe((await ctx.params).id), (await sesionDe(req))?.rol ?? null);
    return { success: true };
  });
}
