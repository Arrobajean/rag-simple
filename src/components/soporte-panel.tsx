"use client";

import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, LifeBuoyIcon, RotateCcwIcon, SendIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SelectCampo } from "@/components/ui/select-campo";
import { CargandoBloques, ErrorCarga } from "@/components/panel/estado-carga";
import { useSesion } from "@/hooks/use-sesion";
import { useSoporte } from "@/hooks/use-soporte";

const TIPOS = {
  soporte: { etiqueta: "Soporte", icono: LifeBuoyIcon, clase: "border-sky-500/30 text-sky-700 dark:text-sky-400" },
  feedback: { etiqueta: "Feedback", icono: SendIcon, clase: "border-violet-500/30 text-violet-700 dark:text-violet-400" },
} as const;

const fmtFecha = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

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

export function SoportePanel() {
  const { esAdmin, rol } = useSesion();
  const s = useSoporte();

  if (rol && !esAdmin) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        <ShieldAlertIcon className="size-5" /> Esta pantalla es solo para administradores.
      </div>
    );
  }
  if (s.loading && !s.datos) return <CargandoBloques n={3} />;
  if (s.error || !s.datos) return <ErrorCarga mensaje={s.error ?? "Sin datos"} onReintentar={s.recargar} />;

  const { resumen, items, total } = s.datos;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Cifra titulo="Mensajes" valor={String(resumen.total)} />
        <Cifra titulo="Sin revisar" valor={String(resumen.nuevos)} detalle="pendientes de leer" />
        <Cifra titulo="Soporte" valor={String(resumen.soporte)} detalle="incidencias y dudas" />
        <Cifra titulo="Feedback" valor={String(resumen.feedback)} detalle="sugerencias de mejora" />
      </div>

      <section className="space-y-3" aria-label="Mensajes de soporte y feedback">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Qué dejan los usuarios</h2>
          <SelectCampo
            aria-label="Filtrar por tipo"
            className="w-48"
            value={s.tipo}
            placeholder="Todos"
            opciones={[
              ["soporte", "Solo soporte"],
              ["feedback", "Solo feedback"],
            ]}
            onChange={s.cambiarTipo}
          />
        </div>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Todavía no hay mensajes. Aparecerán aquí en cuanto alguien use Soporte o Feedback desde el menú lateral.</p>
        ) : (
          <ul className={`space-y-2 ${s.loading ? "opacity-60" : ""}`}>
            {items.map((m) => {
              const t = TIPOS[m.tipo];
              const Icono = t.icono;
              return (
                <li key={m.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icono className="size-4 text-muted-foreground" />
                      <Badge variant="outline" className={`text-[11px] ${t.clase}`}>
                        {t.etiqueta}
                      </Badge>
                      <span className="min-w-0 truncate">{m.nombre ?? m.email ?? "Anónimo"}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant={m.estado === "nuevo" ? "default" : "outline"} className="text-[11px]">
                        {m.estado === "nuevo" ? "Nuevo" : "Revisado"}
                      </Badge>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmtFecha.format(new Date(m.created_at))}</span>
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{m.mensaje}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="truncate text-xs text-muted-foreground">
                      {m.nombre && m.email ? m.email : m.rol ? `Rol: ${m.rol}` : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 text-xs"
                      onClick={() => s.marcar(m.id, m.estado === "nuevo" ? "revisado" : "nuevo")}
                    >
                      {m.estado === "nuevo" ? (
                        <>
                          <CheckIcon className="mr-1.5 size-3.5" /> Marcar revisado
                        </>
                      ) : (
                        <>
                          <RotateCcwIcon className="mr-1.5 size-3.5" /> Marcar nuevo
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {total > 25 && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Button variant="outline" size="icon" className="size-8" disabled={s.pagina <= 1} onClick={() => s.setPagina(s.pagina - 1)} aria-label="Página anterior">
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="tabular-nums">Página {s.pagina} de {s.totalPaginas}</span>
            <Button variant="outline" size="icon" className="size-8" disabled={s.pagina >= s.totalPaginas} onClick={() => s.setPagina(s.pagina + 1)} aria-label="Página siguiente">
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
