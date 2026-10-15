import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
import type { FichaPropiedad } from "@/lib/types";

/** Zona de la unidad y datos del edificio al que pertenece. */
export function FichaUbicacion({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad;
  const e = (ficha.edificio ?? {}) as Record<string, unknown>;

  return (
    <SeccionFicha id="ubicacion" titulo="Ubicación">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <DatoFicha etiqueta="Municipio" valor={String(u.municipio ?? "—")} />
        <DatoFicha etiqueta="Distrito" valor={String(u.distrito ?? "—")} />
        <DatoFicha etiqueta="Barrio" valor={String(u.barrio ?? "—")} />
        <DatoFicha etiqueta="Zona" valor={String(u.zona ?? "—")} />
        <DatoFicha etiqueta="Dirección" valor={String(u.direccion ?? "—")} />
        <DatoFicha etiqueta="Código postal" valor={String(u.codigo_postal ?? "—")} />
        <DatoFicha etiqueta="Edificio" valor={String(e.referencia ?? "—")} />
        <DatoFicha etiqueta="Plantas del edificio" valor={e.plantas != null ? String(e.plantas) : "—"} />
      </dl>
    </SeccionFicha>
  );
}
