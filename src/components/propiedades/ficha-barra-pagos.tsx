import { periodoCorto, tonoPago, type TonoPago } from "@/lib/ficha";
import { eur } from "@/lib/format";
import { cn } from "@/lib/utils";

const ESTILO: Record<TonoPago, string> = {
  ok: "bg-emerald-500",
  retraso: "bg-amber-500",
  pendiente: "border border-dashed border-amber-500",
  impagado: "bg-destructive",
};

const ETIQUETA: Record<TonoPago, string> = {
  ok: "Pagado",
  retraso: "Pagado con retraso",
  pendiente: "Pendiente",
  impagado: "Impagado",
};

/** Últimos recibos del contrato, del más antiguo al más reciente, cada uno con el color de su estado. */
export function BarraPagos({ pagos }: { pagos: Record<string, unknown>[] }) {
  if (pagos.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <ol className="flex gap-1" aria-label="Últimos recibos">
        {[...pagos].reverse().map((p, i) => {
          const tono = tonoPago(p);
          return (
            <li
              key={i}
              title={`${periodoCorto(p.periodo)} · ${ETIQUETA[tono]} · ${eur(Number(p.importe))}`}
              className={cn("h-4 flex-1 rounded-[3px]", ESTILO[tono])}
            >
              <span className="sr-only">{`${periodoCorto(p.periodo)} ${ETIQUETA[tono]}`}</span>
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-muted-foreground">Últimos {pagos.length} recibos</p>
    </div>
  );
}
