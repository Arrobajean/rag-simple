import { NextResponse } from "next/server";
import { configLinkedIn } from "@/lib/auth";
import { COOKIE_ESTADO, RUTA_CALLBACK, urlAutorizacion } from "@/lib/auth-linkedin";

/** Inicia el login con LinkedIn: guarda un estado aleatorio (anti-CSRF) y redirige a LinkedIn. */
export async function GET(req: Request) {
  const cliente = configLinkedIn();
  if (!cliente) return NextResponse.redirect(new URL("/login?error=linkedin_no_configurado", req.url));

  const estado = crypto.randomUUID();
  const redirectUri = new URL(RUTA_CALLBACK, req.url).toString();
  const res = NextResponse.redirect(urlAutorizacion(cliente.clientId, redirectUri, estado));
  res.cookies.set(COOKIE_ESTADO, estado, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/linkedin",
    maxAge: 600,
  });
  return res;
}
