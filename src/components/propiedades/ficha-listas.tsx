import Link from "next/link";
import { FileTextIcon, UserRoundIcon, WrenchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { eur, fecha } from "@/lib/format";
import { tipoDocumento } from "@/lib/etiquetas";
import type { FichaPropiedad } from "@/lib/types";

export function FichaDocumentos({ documentos }: { documentos: FichaPropiedad["documentos"] }) {
  return (
    <SeccionFicha icono={FileTextIcon} titulo="Documentos" extra={documentos.length}>
      {documentos.length === 0 && <p className="text-sm text-muted-foreground">Sin documentos vinculados.</p>}
      <ul className="space-y-1">
        {documentos.map((d) => (
          <li key={d.id}>
            <Link href={`/dashboard/documentos/${d.id}`} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50">
              <span className="truncate">{d.titulo}</span>
              <span className="flex shrink-0 gap-1">
                <Badge variant="outline">{tipoDocumento(d.tipo)}</Badge>
                {!d.vigente && <Badge variant="destructive">Sustituido</Badge>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SeccionFicha>
  );
}

export function FichaIncidencias({ incidencias }: { incidencias: FichaPropiedad["incidencias"] }) {
  if (incidencias.length === 0) return null;
  return (
    <SeccionFicha icono={WrenchIcon} titulo="Incidencias recientes" extra={incidencias.length}>
      <ul className="space-y-1 text-sm">
        {incidencias.map((i, n) => (
          <li key={n} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <span className="truncate">{String(i.descripcion)}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{String(i.estado)} · {fecha(String(i.apertura))}</span>
          </li>
        ))}
      </ul>
    </SeccionFicha>
  );
}

export function FichaClientes({ clientes }: { clientes: FichaPropiedad["clientes_interesados"] }) {
  if (clientes.length === 0) return null;
  return (
    <SeccionFicha icono={UserRoundIcon} titulo="Clientes a los que encaja" extra={clientes.length}>
      <ul className="space-y-1">
        {clientes.map((c) => (
          <li key={c.cliente_id} className="rounded-md border px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{c.cliente}</span>
              <Badge variant="secondary" className="shrink-0 tabular-nums">{c.puntuacion} / 100</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {c.telefono} · hasta {eur(c.presupuesto_max)} · {c.motivos.join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </SeccionFicha>
  );
}
