import { supabaseDb } from "@/lib/db";
import { idDe, manejar } from "@/lib/api-server";

/** Ficha del cliente (datos y demandas) y propiedades disponibles que encajan con sus demandas activas. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const id = idDe((await ctx.params).id);
    const db = supabaseDb();
    const [clientes, coincidencias] = await Promise.all([
      db.seleccionar("clientes", {
        columnas: "id, nombre, tipo, telefono, email, notas, demandas(id, operacion, presupuesto_max, activa)",
        igual: { id },
        limite: 1,
      }),
      db.rpc("rpc_coincidencias_cliente", { p_cliente: id, p_limite: 12 }),
    ]);
    return { cliente: clientes[0] ?? null, coincidencias };
  });
}
