"use client";

import { ChevronLeftIcon, ChevronRightIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SelectCampo } from "@/components/ui/select-campo";
import { CargandoBloques, ErrorCarga } from "@/components/panel/estado-carga";
import { useSesion } from "@/hooks/use-sesion";
import { useAccesos } from "@/hooks/use-accesos";

const ROLES = { admin: "Administrador", gestor: "Gestor", visitante: "Visitante" } as const;
const METODOS = { linkedin: "LinkedIn", contrasena: "Contraseña" } as const;

const fmtFecha = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Resumen legible del navegador y el tipo de dispositivo a partir del User-Agent. */
function dispositivo(ua: string | null): string {
  if (!ua) return "—";
  const navegador = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Otro";
  return `${navegador} · ${/Mobi|Android|iPhone|iPad/i.test(ua) ? "móvil" : "escritorio"}`;
}

function Cifra({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <Card className="shadow-xs">
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
        <p className="text-2xl font-semibold tabular-nums">{valor}</p>
        {detalle && <p className="text-xs text-muted-foreground">{detalle}</p>}
      </CardContent>
    </Card>
  );
}

export function AccesosPanel() {
  const { esAdmin, rol } = useSesion();
  const a = useAccesos();

  if (rol && !esAdmin) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        <ShieldAlertIcon className="size-5" /> Esta pantalla es solo para administradores.
      </div>
    );
  }
  if (a.loading && !a.datos) return <CargandoBloques n={3} />;
  if (a.error || !a.datos) return <ErrorCarga mensaje={a.error ?? "Sin datos"} onReintentar={a.recargar} />;

  const { resumen, items, total } = a.datos;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <Cifra titulo="Accesos registrados" valor={String(resumen.total)} />
        <Cifra titulo="Últimas 24 h" valor={String(resumen.ultimas24h)} detalle="entradas en el último día" />
      </div>

      <section className="space-y-3" aria-label="Registro de accesos">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Quién ha entrado</h2>
          <SelectCampo aria-label="Filtrar por método" className="w-48" value={a.metodo} placeholder="Todos" opciones={[["linkedin", "Solo LinkedIn"], ["contrasena", "Solo contraseña"]]} onChange={a.cambiarMetodo} />
        </div>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Todavía no hay accesos registrados. Aparecerán aquí en cuanto alguien inicie sesión.</p>
        ) : (
          <ul className={`divide-y rounded-lg border ${a.loading ? "opacity-60" : ""}`}>
            {items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-3 text-sm">
                <span className="min-w-0 truncate font-medium">{i.email ?? "—"}</span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px]">{ROLES[i.rol]}</Badge>
                  <Badge variant="outline" className="text-[11px]">{METODOS[i.metodo]}</Badge>
                  <span className="text-xs text-muted-foreground">{dispositivo(i.user_agent)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmtFecha.format(new Date(i.created_at))}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {total > 25 && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Button variant="outline" size="icon" className="size-8" disabled={a.pagina <= 1} onClick={() => a.setPagina(a.pagina - 1)} aria-label="Página anterior">
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="tabular-nums">Página {a.pagina} de {a.totalPaginas}</span>
            <Button variant="outline" size="icon" className="size-8" disabled={a.pagina >= a.totalPaginas} onClick={() => a.setPagina(a.pagina + 1)} aria-label="Página siguiente">
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
