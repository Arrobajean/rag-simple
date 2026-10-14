import { NextResponse } from "next/server";
import { registrarAcceso } from "@/lib/accesos";
import { COOKIE, configLinkedIn, DURACION_SEG, firmarSesion, leerCookie } from "@/lib/auth";
import { COOKIE_ESTADO, listasDeEntorno, RUTA_CALLBACK, rolDeEmail } from "@/lib/auth-linkedin";

/** Vuelta de LinkedIn: valida el estado, cambia el código por un token y asigna el rol según las listas. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cliente = configLinkedIn();
  if (!cliente) return fallo(req, "linkedin_no_configurado");
  if (url.searchParams.get("error")) return fallo(req, "linkedin_cancelado");

  const code = url.searchParams.get("code");
  const estado = url.searchParams.get("state");
  const esperado = leerCookie(req.headers.get("cookie"), COOKIE_ESTADO);
  if (!code || !estado || !esperado || estado !== esperado) return fallo(req, "linkedin_estado");

  try {
    const redirectUri = new URL(RUTA_CALLBACK, req.url).toString();
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: cliente.clientId,
        client_secret: cliente.clientSecret,
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return fallo(req, "linkedin_token");
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return fallo(req, "linkedin_token");

    const perfilRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });
    if (!perfilRes.ok) return fallo(req, "linkedin_perfil");
    const perfil = (await perfilRes.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };
    if (!perfil.email || perfil.email_verified !== true) return fallo(req, "linkedin_email");

    const rol = rolDeEmail(perfil.email, listasDeEntorno());
    const nombre = perfil.name || [perfil.given_name, perfil.family_name].filter(Boolean).join(" ") || perfil.email.split("@")[0];
    await registrarAcceso(req, { email: perfil.email, rol, metodo: "linkedin" });

    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set(COOKIE, await firmarSesion({ rol, nombre, email: perfil.email, foto: perfil.picture }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DURACION_SEG,
    });
    res.cookies.delete({ name: COOKIE_ESTADO, path: "/api/auth/linkedin" });
    return res;
  } catch {
    return fallo(req, "linkedin_red");
  }
}

/** Vuelve al login con un código de error (nunca con datos del perfil ni con el token). */
function fallo(req: Request, motivo: string) {
  const res = NextResponse.redirect(new URL(`/login?error=${motivo}`, req.url));
  res.cookies.delete({ name: COOKIE_ESTADO, path: "/api/auth/linkedin" });
  return res;
}
