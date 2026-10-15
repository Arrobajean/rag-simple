import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { etiquetaAtributo, valorAtributo } from "@/lib/ficha";
import { fecha } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FichaPropiedad } from "@/lib/types";

const si = (v: unknown) => (v ? "Sí" : "No");

const ENERGIA: Record<string, string> = {
  a: "bg-emerald-500 text-white",
  b: "bg-lime-500 text-white",
  c: "bg-yellow-400 text-black",
  d: "bg-amber-500 text-white",
  e: "bg-orange-500 text-white",
  f: "bg-red-500 text-white",
  g: "bg-red-700 text-white",
};

function EtiquetaEnergia({ letra, caducidad }: { letra: string; caducidad: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("flex size-6 items-center justify-center rounded-md text-xs font-bold", ENERGIA[letra.toLowerCase()] ?? "bg-muted text-muted-foreground")}>
        {letra.toUpperCase()}
      </span>
      {caducidad !== "—" && <span className="text-xs font-normal text-muted-foreground">caduca {caducidad}</span>}
    </span>
  );
}

/** Datos físicos de la unidad y del edificio, certificado energético y campos extra del catálogo. */
export function FichaCaracteristicas({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad;
  const e = (ficha.edificio ?? {}) as Record<string, unknown>;
  const atributos = Object.entries(ficha.atributos).filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <SeccionFicha id="caracteristicas" titulo="Características">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <DatoFicha etiqueta="Planta" valor={u.planta != null ? String(u.planta) : "—"} />
        <DatoFicha etiqueta="Ascensor" valor={si(e.ascensor)} />
        <DatoFicha etiqueta="Mascotas" valor={si(u.admite_mascotas)} />
        <DatoFicha etiqueta="Construcción" valor={e.anio_construccion ? String(e.anio_construccion) : "—"} />
        <DatoFicha etiqueta="Amueblado" valor={si(u.amueblado)} />
        <DatoFicha etiqueta="Terraza" valor={si(u.terraza)} />
        <DatoFicha etiqueta="Garaje" valor={si(e.garaje)} />
        <DatoFicha etiqueta="Portero" valor={si(e.portero)} />
        <DatoFicha etiqueta="Piscina" valor={si(e.piscina)} />
        <DatoFicha
          etiqueta="Energía"
          valor={
            u.certificado_energetico ? (
              <EtiquetaEnergia letra={String(u.certificado_energetico)} caducidad={fecha(String(u.certificado_caducidad ?? ""))} />
            ) : (
              "—"
            )
          }
        />
        <DatoFicha etiqueta="Disponible desde" valor={fecha(String(u.fecha_disponible ?? ""))} />
        <DatoFicha etiqueta="Ref. catastral" valor={<span className="font-mono text-xs">{String(u.referencia_catastral ?? "—")}</span>} />
        {atributos.map(([clave, valor]) => (
          <DatoFicha key={clave} etiqueta={etiquetaAtributo(clave)} valor={valorAtributo(valor)} />
        ))}
      </dl>
    </SeccionFicha>
  );
}
