// Pruebas del login con LinkedIn y de los roles (sin LinkedIn ni base de datos).
//   pnpm auth:test
import assert from "node:assert/strict";
import { accesoAbierto, accesoConfigurado, COOKIE, exigirAdmin, exigirEscritura, firmarSesion, verificarSesion } from "../src/lib/auth";
import { listaDeEmails, listasDeEntorno, rolDeEmail, urlAutorizacion } from "../src/lib/auth-linkedin";

// Entorno de prueba: las funciones leen las variables al llamarlas, así que basta con fijarlas aquí
process.env.AUTH_SECRET = "prueba-secreto-auth";
process.env.APP_REQUIRE_LOGIN = "true";
process.env.APP_ADMIN_EMAILS = "Admin@Ejemplo.com, otro-admin@ejemplo.com";
delete process.env.APP_PASSWORD;
delete process.env.APP_ADMIN_PASSWORD;
delete process.env.LINKEDIN_CLIENT_ID;
delete process.env.LINKEDIN_CLIENT_SECRET;

const casos: { nombre: string; fn: () => void | Promise<void> }[] = [];
const caso = (nombre: string, fn: () => void | Promise<void>) => casos.push({ nombre, fn });

const peticion = (cookie?: string) => new Request("http://localhost/api/documents/1", { method: "DELETE", headers: cookie ? { cookie: `${COOKIE}=${cookie}` } : {} });

// ── Listas de acceso ───────────────────────────────────────────────────────────────────────────
caso("los emails se normalizan: minúsculas, espacios y vacíos fuera", () => {
  assert.deepEqual(listaDeEmails(" A@x.com ,, b@X.com "), ["a@x.com", "b@x.com"]);
  assert.deepEqual(listaDeEmails(undefined), []);
});

caso("el admin sale de la lista, sin distinguir mayúsculas", () => {
  assert.equal(rolDeEmail("ADMIN@ejemplo.com", listasDeEntorno()), "admin");
});

caso("cualquier otra cuenta de LinkedIn entra como visitante", () => {
  assert.equal(rolDeEmail("desconocido@ejemplo.com", listasDeEntorno()), "visitante");
});

// ── URL de autorización ────────────────────────────────────────────────────────────────────────
caso("la URL de LinkedIn pide solo openid, profile y email, con el estado", () => {
  const url = new URL(urlAutorizacion("cliente-123", "http://localhost:3000/api/auth/linkedin/callback", "estado-abc"));
  assert.equal(url.origin, "https://www.linkedin.com");
  assert.equal(url.pathname, "/oauth/v2/authorization");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("client_id"), "cliente-123");
  assert.equal(url.searchParams.get("redirect_uri"), "http://localhost:3000/api/auth/linkedin/callback");
  assert.equal(url.searchParams.get("state"), "estado-abc");
  assert.equal(url.searchParams.get("scope"), "openid profile email");
});

// ── Sesiones y guard de escritura ──────────────────────────────────────────────────────────────
caso("el acceso queda cerrado con APP_REQUIRE_LOGIN=true", () => {
  assert.equal(accesoAbierto(), false);
});

caso("la sesión de visitante se verifica como visitante", async () => {
  const s = await verificarSesion(await firmarSesion("visitante"));
  assert.equal(s?.rol, "visitante");
});

caso("una petición sin sesión no puede escribir", async () => {
  const res = await exigirEscritura(peticion());
  assert.ok(res, "debería denegar");
  assert.equal(res.status, 403);
});

caso("un visitante puede escribir como un gestor", async () => {
  assert.equal(await exigirEscritura(peticion(await firmarSesion("visitante"))), null);
  assert.equal(await exigirEscritura(peticion(await firmarSesion("gestor"))), null);
  assert.equal(await exigirEscritura(peticion(await firmarSesion("admin"))), null);
});

caso("un visitante no tiene funciones de administrador", async () => {
  const res = await exigirAdmin(peticion(await firmarSesion("visitante")));
  assert.ok(res, "debería denegar");
  assert.equal(res.status, 403);
  assert.equal(await exigirAdmin(peticion(await firmarSesion("admin"))), null);
});

caso("una cookie falsificada no vale", async () => {
  const firmada = await firmarSesion("visitante");
  const falsa = firmada.slice(0, firmada.lastIndexOf(".") + 1) + "AAAA";
  assert.equal(await verificarSesion(falsa), null);
});

// ── Configuración ──────────────────────────────────────────────────────────────────────────────
caso("LinkedIn cuenta como acceso configurado solo con cliente y secreto", () => {
  assert.equal(accesoConfigurado(), false);
  process.env.LINKEDIN_CLIENT_ID = "cliente";
  process.env.LINKEDIN_CLIENT_SECRET = "secreto";
  assert.equal(accesoConfigurado(), true);
  delete process.env.LINKEDIN_CLIENT_ID;
  delete process.env.LINKEDIN_CLIENT_SECRET;
});

async function main() {
  let fallos = 0;
  for (const { nombre, fn } of casos) {
    try {
      await fn();
      console.log(`✔ ${nombre}`);
    } catch (err) {
      fallos++;
      console.log(`✘ ${nombre}`);
      console.log(`  ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\n${casos.length - fallos} de ${casos.length} pruebas correctas`);
  if (fallos) process.exit(1);
}

main();
