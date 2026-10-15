import { ExternalLinkIcon, MapPinIcon } from "lucide-react";
import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { eur } from "@/lib/format";
import type { FichaPropiedad } from "@/lib/types";

/** Zona de la unidad, datos del edificio y enlace a un mapa. */
export function FichaUbicacion({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad;
  const e = (ficha.edificio ?? {}) as Record<string, unknown>;

  const lat = u.lat != null ? String(u.lat) : null;
  const lng = u.lng != null ? String(u.lng) : null;
  const texto = [u.direccion, u.municipio].filter(Boolean).join(", ");
  const mapa =
    lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : texto
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto)}`
        : null;
  const cuota = Number(e.cuota_comunidad_media);

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
        <DatoFicha etiqueta="Administrador" valor={String(e.administrador_fincas ?? "—")} />
        <DatoFicha etiqueta="Cuota comunidad" valor={Number.isFinite(cuota) && cuota > 0 ? `${eur(cuota)}/mes` : "—"} />
      </dl>

      {mapa && (
        <a
          href={mapa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MapPinIcon className="size-3.5" /> Ver en el mapa
          <ExternalLinkIcon className="size-3" />
        </a>
      )}
    </SeccionFicha>
  );
}
