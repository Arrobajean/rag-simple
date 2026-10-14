import { sesionDe } from "@/lib/auth";

// Solo dominios de LinkedIn: la URL viene firmada en la cookie, pero no queremos que este proxy
// sirva de intermediario hacia cualquier host (SSRF).
const PERMITIDO = /^https:\/\/[^/]*\.(licdn\.com|linkedin\.com)\//i;

/** Sirve la foto de perfil de LinkedIn desde nuestro dominio (la CSP solo permite imágenes propias). */
export async function GET(req: Request) {
  const url = (await sesionDe(req))?.foto;
  if (!url || !PERMITIDO.test(url)) return new Response(null, { status: 404 });
  try {
    const res = await fetch(url, { cache: "no-store" });
    const tipo = res.headers.get("content-type") ?? "";
    if (!res.ok || !tipo.startsWith("image/")) return new Response(null, { status: 404 });
    return new Response(res.body, { headers: { "Content-Type": tipo, "Cache-Control": "private, max-age=1800" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
