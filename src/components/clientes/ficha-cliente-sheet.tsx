"use client";

import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CargandoFicha, ErrorCarga } from "@/components/panel/estado-carga";
import { dec, eur } from "@/lib/format";
import { operacion as etiquetaOperacion, tipoUnidad } from "@/lib/etiquetas";
import { useFichaCliente } from "@/hooks/use-clientes";

/** Ficha lateral de un cliente: datos, demandas y propiedades disponibles que encajan. */
export function FichaClienteSheet({ id, onClose, onAbrirPropiedad }: { id: number | null; onClose: () => void; onAbrirPropiedad: (ref: string) => void }) {
  const { datos, loading, error, recargar } = useFichaCliente(id);
  const cliente = datos?.cliente ?? null;
  const coincidencias = datos?.coincidencias ?? [];

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <span className="truncate">{cliente ? cliente.nombre : "Ficha de cliente"}</span>
            {cliente && <Badge variant="outline" className="shrink-0 capitalize">{cliente.tipo}</Badge>}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {cliente ? [cliente.telefono, cliente.email].filter(Boolean).join(" · ") || "Sin datos de contacto" : "Cargando ficha…"}
          </SheetDescription>
          {cliente && (
            <Link href={`/dashboard/clientes?cliente=${cliente.id}`} className="mt-1 inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Abrir en la app <ExternalLinkIcon className="size-3" />
            </Link>
          )}
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
          {loading && !datos ? (
            <CargandoFicha />
          ) : error || !cliente ? (
            <ErrorCarga mensaje={error ?? "No se encontró el cliente"} onReintentar={recargar} />
          ) : (
            <div className="space-y-6 pt-4">
              {cliente.notas && <p className="text-sm leading-relaxed text-foreground/90">{cliente.notas}</p>}

              <section className="space-y-2">
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Demandas</h3>
                {cliente.demandas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin demandas registradas.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {cliente.demandas.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                        <span>{etiquetaOperacion(d.operacion)}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="tabular-nums">{eur(d.presupuesto_max)}</span>
                          <Badge variant={d.activa ? "secondary" : "outline"}>{d.activa ? "Activa" : "Inactiva"}</Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Propiedades disponibles que encajan</h3>
                {coincidencias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ninguna propiedad disponible encaja ahora con su demanda.</p>
                ) : (
                  <ul className="space-y-2">
                    {coincidencias.map((m) => (
                      <li key={`${m.demanda_id}-${m.unidad_id}`}>
                        <button type="button" onClick={() => onAbrirPropiedad(m.referencia)} className="w-full rounded-lg border p-3 text-left hover:bg-muted/50">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium">{m.ubicacion}</span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">{eur(m.precio)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {m.referencia} · {tipoUnidad(m.tipo)} · {dec(m.superficie_m2)} m² · {m.habitaciones ?? 0} hab. · {m.distrito ?? m.municipio}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={m.puntuacion} className="h-1.5 flex-1" aria-label={`Encaje ${m.puntuacion} de 100`} />
                            <span className="text-xs font-medium tabular-nums">{m.puntuacion}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.motivos.map((t) => (
                              <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                            ))}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
