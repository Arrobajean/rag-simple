// Control de acceso: cookie firmada (HMAC-SHA256) con rol. Funciona en el proxy y en las rutas
// (solo usa Web Crypto). Roles: "gestor" (uso diario), "admin" (además aprueba campos del catálogo
// y ve valoraciones y auditoría) y "visitante" (cuenta de LinkedIn: usa la app como un gestor, sin funciones de admin).

export type Rol = "gestor" | "admin" | "visitante";
export interface Sesion {
  rol: Rol;
  exp: number;
  /** Identidad de la cuenta (solo el acceso por LinkedIn la aporta). */
  nombre?: string;
  email?: string;
  foto?: string;
}

/** Datos con los que se firma la cookie. `nombre`, `email` y `foto` solo llegan del perfil de LinkedIn. */
export interface DatosSesion {
  rol: Rol;
  nombre?: string | null;
  email?: string | null;
  foto?: string | null;
}

export const COOKIE = "rag_session";
export const DURACION_SEG = 60 * 60 * 12;

const enc = new TextEncoder();

function secreto(): string | null {
  return process.env.AUTH_SECRET || process.env.SUPABASE_KEY || null;
}

/** Contraseñas de la app (gestor y admin). */
export function passwordConfigurado(): boolean {
  return !!(process.env.APP_PASSWORD || process.env.APP_ADMIN_PASSWORD);
}

/** Cliente OAuth de LinkedIn, si está completo. */
export function configLinkedIn(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function linkedinConfigurado(): boolean {
  return configLinkedIn() !== null;
}

/** ¿Está el acceso configurado? En producción es obligatorio: sin contraseñas ni LinkedIn, nadie entra. */
export function accesoConfigurado(): boolean {
  return passwordConfigurado() || linkedinConfigurado();
}

/**
 * Acceso abierto (rol admin para todos) por defecto: cualquiera con la URL puede ver y borrar datos.
 * Para exigir contraseña, define APP_REQUIRE_LOGIN=true junto con APP_PASSWORD / APP_ADMIN_PASSWORD.
 */
export function accesoAbierto(): boolean {
  return process.env.APP_REQUIRE_LOGIN !== "true";
}

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function clave(): Promise<CryptoKey> {
  const s = secreto();
  if (!s) throw new Error("Falta AUTH_SECRET (o SUPABASE_KEY) para firmar sesiones");
  return crypto.subtle.importKey("raw", enc.encode(s), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function firmarSesion(datos: DatosSesion): Promise<string> {
  const sesion: Sesion = { rol: datos.rol, exp: Math.floor(Date.now() / 1000) + DURACION_SEG };
  if (datos.nombre) sesion.nombre = datos.nombre.slice(0, 80);
  if (datos.email) sesion.email = datos.email.slice(0, 160);
  if (datos.foto) sesion.foto = datos.foto.slice(0, 600);
  const payload = b64(enc.encode(JSON.stringify(sesion)));
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", await clave(), enc.encode(payload)));
  return `${payload}.${b64(firma)}`;
}

export async function verificarSesion(valor: string | undefined | null): Promise<Sesion | null> {
  if (!valor) return null;
  const [payload, firma] = valor.split(".");
  if (!payload || !firma) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await clave(), deB64(firma), enc.encode(payload));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(deB64(payload))) as Sesion;
    if (!(s.exp > Date.now() / 1000) || (s.rol !== "gestor" && s.rol !== "admin" && s.rol !== "visitante")) return null;
    const texto = (v: unknown) => (typeof v === "string" ? v : undefined);
    return { rol: s.rol, exp: s.exp, nombre: texto(s.nombre), email: texto(s.email), foto: texto(s.foto) };
  } catch {
    return null;
  }
}

/** Comparación en tiempo casi constante de contraseñas. */
function iguales(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export function rolPorContrasena(password: string): Rol | null {
  const admin = process.env.APP_ADMIN_PASSWORD;
  const gestor = process.env.APP_PASSWORD;
  if (admin && iguales(password, admin)) return "admin";
  if (gestor && iguales(password, gestor)) return "gestor";
  return null;
}

export function leerCookie(cabecera: string | null, nombre = COOKIE): string | null {
  if (!cabecera) return null;
  for (const parte of cabecera.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nombre) return v.join("=");
  }
  return null;
}

/** Sesión de una petición a una ruta de API (el proxy ya filtra, esto sirve para comprobar el rol). */
export async function sesionDe(req: Request): Promise<Sesion | null> {
  if (accesoAbierto()) return { rol: "admin", exp: Number.MAX_SAFE_INTEGER };
  return verificarSesion(leerCookie(req.headers.get("cookie")));
}

export async function exigirAdmin(req: Request): Promise<Response | null> {
  const s = await sesionDe(req);
  if (s?.rol === "admin") return null;
  return Response.json({ error: "Solo un administrador puede hacer esto" }, { status: 403 });
}

/** Cualquier sesión válida puede modificar datos (gestor, visitante o admin). Lo exclusivo del admin usa exigirAdmin. */
export async function exigirEscritura(req: Request): Promise<Response | null> {
  if (await sesionDe(req)) return null;
  return Response.json({ error: "Necesitas iniciar sesión para modificar datos." }, { status: 403 });
}
