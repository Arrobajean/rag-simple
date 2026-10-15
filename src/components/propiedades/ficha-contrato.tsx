import { BarraPagos } from "@/components/propiedades/ficha-barra-pagos";
import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { tipoContrato } from "@/lib/etiquetas";
import { eur, fecha } from "@/lib/format";
import type { FichaPropiedad } from "@/lib/types";

/** Contrato vigente: condiciones, importes y la barra de los últimos recibos. */
export function FichaContrato({ ficha }: { ficha: FichaPropiedad }) {
  const c = ficha.contrato_vigente;
  if (!c) {
    return (
      <SeccionFicha id="contrato" titulo="Contrato">
        <p className="text-sm text-muted-foreground">Sin contrato de alquiler vigente.</p>
      </SeccionFicha>
    );
  }

  return (
    <SeccionFicha id="contrato" titulo={`Contrato · ${String(c.referencia)}`}>
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <p>
            {tipoContrato(String(c.tipo))}
            <span className="text-muted-foreground"> · {String(c.indice_actualizacion ?? "—")}</span>
          </p>
          <p className="text-muted-foreground">
            {fecha(String(c.inicio))} → {fecha(String(c.fin))}
          </p>
          <p className="text-muted-foreground">
            Renta {eur(Number(c.renta_mensual))} · Fianza {eur(Number(c.fianza))}
            {!c.fianza_depositada && <span className="text-amber-600 dark:text-amber-400"> · sin depositar</span>}
          </p>
        </div>
        <BarraPagos pagos={ficha.pagos_recientes} />
      </div>
    </SeccionFicha>
  );
}
