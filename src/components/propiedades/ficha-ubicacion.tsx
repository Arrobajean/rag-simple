import { Building2Icon, MapPinIcon, UserRoundIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
import type { FichaPropiedad } from "@/lib/types";

function EdificioDetalle({ e }: { e: Record<string, unknown> }) {
  const partes = [
    e.anio_construccion ? `construido en ${e.anio_construccion}` : null,
    e.plantas ? `${e.plantas} plantas` : null,
    e.ascensor ? "con ascensor" : "sin ascensor",
    e.administrador_fincas ? `administra ${e.administrador_fincas}` : null,
  ].filter(Boolean);
  return (
    <div className="space-y-1 rounded-lg border p-3 text-sm">
      <p className="font-medium">
        {String(e.direccion ?? "—")} <span className="font-normal text-muted-foreground">· Edificio {String(e.referencia ?? "—")}</span>
      </p>
      {partes.length > 0 && <p className="text-xs text-muted-foreground">{partes.join(" · ")}</p>}
    </div>
  );
}

/** Ubicación, edificio al que pertenece y propietario. */
export function FichaUbicacion({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad as Record<string, unknown>;
  const e = (ficha.edificio ?? {}) as Record<string, unknown>;
  const p = ficha.propietario as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <SeccionFicha icono={MapPinIcon} titulo="Ubicación">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <DatoFicha etiqueta="Municipio" valor={String(u.municipio ?? "—")} />
          <DatoFicha etiqueta="Distrito" valor={String(u.distrito ?? "—")} />
          <DatoFicha etiqueta="Barrio" valor={String(u.barrio ?? "—")} />
          <DatoFicha etiqueta="Zona" valor={String(u.zona ?? "—")} />
          <DatoFicha etiqueta="Dirección" valor={String(u.direccion ?? "—")} />
          <DatoFicha etiqueta="Código postal" valor={String(u.codigo_postal ?? "—")} />
        </dl>
      </SeccionFicha>

      <SeccionFicha icono={Building2Icon} titulo="Edificio">
        <EdificioDetalle e={e} />
      </SeccionFicha>

      {p && (
        <SeccionFicha icono={UserRoundIcon} titulo="Propietario">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium">{String(p.nombre)}</p>
              <p className="text-xs text-muted-foreground">{[p.telefono, p.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}</p>
            </div>
            {p.tipo ? <Badge variant="outline" className="capitalize">{String(p.tipo)}</Badge> : null}
          </div>
        </SeccionFicha>
      )}
    </div>
  );
}
