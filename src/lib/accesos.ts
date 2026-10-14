import { getSupabaseClient } from "@/lib/rag";
import type { Rol } from "@/lib/auth";

export type MetodoAcceso = "linkedin" | "contrasena";

/**
 * Guarda un acceso correcto en la tabla `accesos`. Nunca lanza: registrar es secundario,
 * un fallo de Supabase no debe impedir que el usuario entre.
 */
export async function registrarAcceso(req: Request, datos: { email?: string | null; rol: Rol; metodo: MetodoAcceso }): Promise<void> {
  try {
    await getSupabaseClient().from("accesos").insert({
      email: datos.email?.trim().toLowerCase() || null,
      rol: datos.rol,
      metodo: datos.metodo,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
  } catch {
    // Silencio a propósito: el registro no puede romper el inicio de sesión.
  }
}
