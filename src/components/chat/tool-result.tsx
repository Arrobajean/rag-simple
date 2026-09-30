import { celda } from "@/lib/format";
import type { Presentacion } from "@/lib/chat/types";

function Barras({ p }: { p: Extract<Presentacion, { tipo: "barras" }> }) {
  const max = Math.max(1, ...p.datos.map((d) => d.valor));
  return (
    <div className="space-y-1.5">
      {p.datos.map((d) => (
        <div key={d.etiqueta} className="grid grid-cols-[minmax(90px,150px)_1fr_auto] items-center gap-2 text-xs">
          <span className="truncate text-muted-foreground">{d.etiqueta}</span>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(d.valor / max) * 100}%` }} />
          </div>
          <span className="tabular-nums font-medium">{d.valor}</span>
        </div>
      ))}
    </div>
  );
}

function Tabla({ p }: { p: Extract<Presentacion, { tipo: "tabla" }> }) {
  if (p.filas.length === 0) return <p className="text-xs text-muted-foreground">Sin resultados.</p>;
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            {p.columnas.map((c) => (
              <th key={c.clave} className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{c.etiqueta}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {p.filas.map((f, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {p.columnas.map((c) => (
                <td key={c.clave} className={`px-2 py-1.5 ${c.formato === "moneda" || c.formato === "numero" ? "tabular-nums text-right" : ""}`}>
                  {celda(f[c.clave], c.formato)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {p.total !== undefined && p.total > p.filas.length && (
        <p className="border-t bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
          Mostrando {p.filas.length} de {p.total}
        </p>
      )}
    </div>
  );
}

/** Resultado de una consulta a la base de datos: tabla o barras, con título. */
export function ToolResult({ presentacion }: { presentacion: Presentacion }) {
  return (
    <figure className="space-y-1.5 rounded-lg border bg-card p-3">
      <figcaption className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{presentacion.titulo}</figcaption>
      {presentacion.tipo === "barras" ? <Barras p={presentacion} /> : <Tabla p={presentacion} />}
    </figure>
  );
}
