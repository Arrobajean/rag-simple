import type { Rol } from "@/lib/auth";

// Login con LinkedIn (OpenID Connect). Aquí solo va la lógica pura: las rutas están en src/app/api/auth/linkedin.

/** Solo identidad y email: la app no pide permisos para publicar en nombre de nadie. */
export const LINKEDIN_SCOPES = "openid profile email";
export const COOKIE_ESTADO = "rag_linkedin_state";
export const RUTA_CALLBACK = "/api/auth/linkedin/callback";

export interface ListasAcceso {
  admin: string[];
}

/** Emails separados por comas → lista en minúsculas, sin vacíos. */
export function listaDeEmails(valor: string | undefined): string[] {
  return (valor ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function listasDeEntorno(env: Record<string, string | undefined> = process.env): ListasAcceso {
  return { admin: listaDeEmails(env.APP_ADMIN_EMAILS) };
}

/** Rol de una cuenta de LinkedIn: los de APP_ADMIN_EMAILS son admin; el resto entra como visitante (usa la app como gestor, sin funciones de admin). */
export function rolDeEmail(email: string, listas: ListasAcceso): Rol {
  return listas.admin.includes(email.trim().toLowerCase()) ? "admin" : "visitante";
}

export function urlAutorizacion(clientId: string, redirectUri: string, estado: string): string {
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", estado);
  url.searchParams.set("scope", LINKEDIN_SCOPES);
  return url.toString();
}
