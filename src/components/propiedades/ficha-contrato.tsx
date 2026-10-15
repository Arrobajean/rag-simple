import { BarraPagos } from "@/components/propiedades/ficha-barra-pagos";
import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { periodoCorto, tonoPago, type TonoPago } from "@/lib/ficha";
import { tipoContrato } from "@/lib/etiquetas";
import { diasRelativos, eur, fecha } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FichaPropiedad } from "@/lib/types";

const ETIQUETA_PAGO: Record<TonoPago, string> = { ok: "Pagado", retraso: "Con retraso", pendiente: "Pendiente", impagado: "Impagado" };
const COLOR_PAGO: Record<TonoPago, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  retraso: "text-amber-600 dark:text-amber-400",
  pendiente: "text-muted-foreground",
  impagado: "text-destructive",
};

/** Días que faltan hasta una fecha "AAAA-MM-DD" (negativo si ya pasó). */
function diasHasta(fin: unknown): number | null {
  const m = String(fin ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const objetivo = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const hoy = new Date();
  const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((objetivo - hoyUTC) / 86_400_000);
}

/** Contrato vigente ampliado: condiciones, importes, recibos e historial de contratos anteriores. */
export function FichaContrato({ ficha }: { ficha: FichaPropiedad }) {
  const c = ficha.contrato_vigente;
  if (!c) {
    return (
      <SeccionFicha id="contrato" titulo="Contrato">
        <p className="text-sm text-muted-foreground">Sin contrato de alquiler vigente.</p>
      </SeccionFicha>
    );
  }

  const fin = String(c.fin ?? "");
  const dias = diasHasta(fin);
  const anteriores = ficha.contratos_anteriores;

  return (
    <SeccionFicha id="contrato" titulo={`Contrato · ${String(c.referencia)}`}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <DatoFicha etiqueta="Tipo" valor={tipoContrato(String(c.tipo))} />
        <DatoFicha etiqueta="Índice" valor={String(c.indice_actualizacion ?? "—")} />
        <DatoFicha etiqueta="Inicio" valor={fecha(String(c.inicio))} />
        <DatoFicha
          etiqueta="Vencimiento"
          valor={
            <span>
              {fecha(fin)}
              {dias !== null && <span className="ml-1 text-xs font-normal text-muted-foreground">({diasRelativos(dias)})</span>}
            </span>
          }
        />
        <DatoFicha etiqueta="Renta" valor={<span className="tabular-nums">{eur(Number(c.renta_mensual))}</span>} />
        <DatoFicha
          etiqueta="Fianza"
          valor={
            <span className="tabular-nums">
              {eur(Number(c.fianza))}
              {!c.fianza_depositada && <span className="ml-1 text-xs font-normal text-amber-600 dark:text-amber-400">· sin depositar</span>}
            </span>
          }
        />
      </dl>

      <BarraPagos pagos={ficha.pagos_recientes} />

      {ficha.pagos_recientes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">Últimos recibos</h4>
          <ul className="divide-y rounded-lg border">
            {ficha.pagos_recientes.map((p, i) => {
              const tono = tonoPago(p);
              return (
                <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="tabular-nums">{periodoCorto(p.periodo)}</span>
                  <span className={cn("text-xs font-medium", COLOR_PAGO[tono])}>{ETIQUETA_PAGO[tono]}</span>
                  <span className="ml-auto tabular-nums">{eur(Number(p.importe))}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {anteriores.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">Contratos anteriores</h4>
          <ul className="divide-y rounded-lg border">
            {anteriores.map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{String(a.referencia)}</span>
                  <span className="text-xs text-muted-foreground">
                    {tipoContrato(String(a.tipo))} · {fecha(String(a.inicio))} → {fecha(String(a.fin))}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{eur(Number(a.renta_mensual))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SeccionFicha>
  );
}
