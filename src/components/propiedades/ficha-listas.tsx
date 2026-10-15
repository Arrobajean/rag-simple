"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FileKindIcon } from "@/components/documents/file-kind";
import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { useAbrirFicha } from "@/components/chat/ficha-context";
import { eur, fecha } from "@/lib/format";
import { tipoDocumento } from "@/lib/etiquetas";
import type { FichaPropiedad } from "@/lib/types";

const VACIO = "text-sm text-muted-foreground";

export function FichaDocumentos({ documentos }: { documentos: FichaPropiedad["documentos"] }) {
  const abrir = useAbrirFicha();

  return (
    <SeccionFicha id="documentos" titulo="Documentos" extra={documentos.length || undefined}>
      {documentos.length === 0 ? (
        <p className={VACIO}>Sin documentos vinculados.</p>
      ) : (
        <ul className="divide-y">
          {documentos.map((d) => {
            const contenido = (
              <>
                <FileKindIcon source={d.titulo} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.titulo}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {tipoDocumento(d.tipo)}
                    {!d.vigente && <Badge variant="destructive" className="h-4 text-[10px]">Sustituido</Badge>}
                  </span>
                </span>
              </>
            );
            return (
              <li key={d.id}>
                {abrir ? (
                  <button type="button" onClick={() => abrir.documento(d.id)} className="flex w-full items-start gap-3 py-2.5 text-left text-sm transition-colors hover:text-primary">
                    {contenido}
                  </button>
                ) : (
                  <Link href={`/dashboard/documentos/${d.id}`} className="flex items-start gap-3 py-2.5 text-sm transition-colors hover:text-primary">
                    {contenido}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SeccionFicha>
  );
}

export function FichaIncidencias({ incidencias }: { incidencias: FichaPropiedad["incidencias"] }) {
  return (
    <SeccionFicha id="incidencias" titulo="Incidencias" extra={incidencias.length || undefined}>
      {incidencias.length === 0 ? (
        <p className={VACIO}>Sin incidencias registradas.</p>
      ) : (
        <ul className="divide-y">
          {incidencias.map((i, n) => (
            <li key={n} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="truncate">{String(i.descripcion)}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {String(i.estado)} · {fecha(String(i.apertura))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SeccionFicha>
  );
}

export function FichaClientes({ clientes }: { clientes: FichaPropiedad["clientes_interesados"] }) {
  return (
    <SeccionFicha id="clientes" titulo="Clientes que encajan" extra={clientes.length || undefined}>
      {clientes.length === 0 ? (
        <p className={VACIO}>Ningún cliente encaja con este piso ahora.</p>
      ) : (
        <ul className="divide-y">
          {clientes.map((c) => (
            <li key={c.cliente_id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">{c.cliente}</span>
                <Badge variant="secondary" className="shrink-0 tabular-nums">
                  {c.puntuacion} / 100
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {c.telefono} · hasta {eur(c.presupuesto_max)} · {c.motivos.join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SeccionFicha>
  );
}
