// Aplica las migraciones pendientes (0016 y 0017) sobre Supabase, todas en una sola transacción.
//   pnpm db:aplicar-pendientes     (requiere SUPABASE_DB_URL en .env: Supabase > Connect > Session pooler)
// No usa la tabla schema_migrations: si no tiene las migraciones 0001–0015, `pnpm db:migrate` las volvería a ejecutar todas.
import { readMigrations } from "./lib/migrations";

try {
  process.loadEnvFile(".env");
} catch {
  // sin .env
}

/** Primera migración que falta en producción. */
const DESDE = "0016";

interface Estado {
  umbral: boolean;
  reemplazar: boolean;
  procesando: boolean;
}

async function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) throw new Error("Falta SUPABASE_DB_URL en .env (Supabase > Connect > Session pooler)");

  const pendientes = readMigrations().filter((m) => m.name >= DESDE);
  const { Client } = await import("pg");
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const estado = async (): Promise<Estado> => {
    const r = await client.query<Estado>(`select
        exists (select 1 from pg_proc where proname = 'rpc_buscar_documentos' and pg_get_function_arguments(oid) like '%p_umbral%') as umbral,
        exists (select 1 from pg_proc where proname = 'rpc_reemplazar_fragmentos') as reemplazar,
        exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documentos' and column_name = 'procesando_desde') as procesando`);
    return r.rows[0];
  };

  try {
    const antes = await estado();
    console.log("Estado antes:", antes);
    if (antes.umbral && antes.reemplazar && antes.procesando) {
      console.log("Las migraciones pendientes ya están aplicadas. No hay nada que hacer.");
      return;
    }

    await client.query("begin");
    try {
      for (const m of pendientes) {
        process.stdout.write(`▶ ${m.name} … `);
        await client.query(m.sql);
        console.log("ok");
      }
      const despues = await estado();
      console.log("Estado después:", despues);
      if (!(despues.umbral && despues.reemplazar && despues.procesando)) {
        throw new Error("La verificación no pasa: alguna función o columna nueva no existe tras aplicar las migraciones");
      }
      await client.query("commit");
      console.log("Migraciones aplicadas.");
    } catch (err) {
      await client.query("rollback");
      console.log("Revertido: la base de datos queda como estaba.");
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
