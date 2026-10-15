import { NextResponse } from "next/server";
import { accesoAbierto, COOKIE, leerCookie, sesionDe, verificarSesion } from "@/lib/auth";

export async function GET(req: Request) {
  // Si hay sesión real (LinkedIn o contraseña) manda su rol; sin ella, en acceso abierto se entra como admin.
  const s = (await verificarSesion(leerCookie(req.headers.get("cookie"), COOKIE))) ?? (await sesionDe(req));
  return NextResponse.json({ rol: s?.rol ?? null, abierto: accesoAbierto(), nombre: s?.nombre ?? null, email: s?.email ?? null, conFoto: !!s?.foto });
}
