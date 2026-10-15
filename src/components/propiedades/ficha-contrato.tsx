import { FileSignatureIcon, UserRoundIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { eur, fecha } from "@/lib/format";
import { tipoContrato } from "@/lib/etiquetas";
import type { FichaPropiedad } from "@/lib/types";

/** Contrato vigente con su inquilino y los últimos recibos. */
export function FichaContrato({ ficha }: { ficha: FichaPropiedad }) {
  const c = ficha.contrato_vigente as Record<string, unknown> | null;
  if (!c) {
    return (
      <SeccionFicha icono={FileSignatureIcon} titulo="Contrato vigente">
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Sin contrato de alquiler vigente.</p>
      </SeccionFicha>
    );
  }
  const inq = c.inquilino as Record<string, unknown> | null;

  return (
    <SeccionFicha icono={FileSignatureIcon} titulo="Contrato vigente" extra={<Badge variant="outline">{String(c.indice_actualizacion)}</Badge>}>
      <div className="space-y-3">
        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">
            {String(c.referencia)} <span className="font-normal text-muted-foreground">· {tipoContrato(String(c.tipo))}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {fecha(String(c.inicio))} → {fecha(String(c.fin))} · renta {eur(Number(c.renta_mensual))} · fianza {eur(Number(c.fianza))}
            {c.fianza_depositada ? "" : " (sin depositar)"}
          </p>
        </div>

        {inq && (
          <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UserRoundIcon className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-medium">{String(inq.nombre)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {[inq.telefono, inq.email, inq.documento ? `doc. ${inq.documento}` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {ficha.pagos_recientes.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Últimos recibos">
            {ficha.pagos_recientes.map((p, i) => {
              const estado = String(p.estado);
              const clase = estado === "pagado" ? (Number(p.dias_retraso) > 0 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600") : "bg-destructive/10 text-destructive";
              return (
                <span key={i} className={`rounded px-2 py-1 text-[11px] ${clase}`} title={`${estado}${p.dias_retraso ? ` · ${p.dias_retraso} días de retraso` : ""}`}>
                  {String(p.periodo).slice(0, 7)} · {eur(Number(p.importe))}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </SeccionFicha>
  );
}
