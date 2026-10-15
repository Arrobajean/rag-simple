import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { EstadoTexto } from "@/components/propiedades/estado-badge";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { situacionCobro } from "@/lib/ficha";
import { eur } from "@/lib/format";
import type { FichaPropiedad } from "@/lib/types";

/** Cabecera: dirección y referencia a la izquierda; precio y situación de cobro a la derecha. */
export function FichaCabecera({ ficha, referencia, enPanel = false }: { ficha: FichaPropiedad | null; referencia: string | null; enPanel?: boolean }) {
  const u = ficha?.unidad;
  const meta = u ? [u.referencia, u.barrio, u.distrito ?? u.zona, u.municipio].filter(Boolean).join(" · ") : "Cargando ficha…";
  const precio = u?.precio ? `${eur(Number(u.precio))}${u.operacion === "venta" ? "" : "/mes"}` : "—";

  return (
    <SheetHeader className="flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b px-5 py-4 pr-12">
      <div className="min-w-0 space-y-1">
        <SheetTitle className="truncate text-lg">{u ? String(u.ubicacion) : referencia}</SheetTitle>
        <SheetDescription className="truncate text-xs">{meta}</SheetDescription>
        {enPanel && u && (
          <Link
            href={`/dashboard/propiedades?ref=${encodeURIComponent(String(u.referencia))}`}
            className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Abrir en la app <ExternalLinkIcon className="size-3" />
          </Link>
        )}
      </div>
      {u && (
        <div className="shrink-0 space-y-1 text-right">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{precio}</p>
          <EstadoTexto estado={String(u.estado)} situacion={ficha && situacionCobro(ficha.pagos_recientes)} />
        </div>
      )}
    </SheetHeader>
  );
}
