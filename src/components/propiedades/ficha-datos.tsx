import { ZapIcon } from "lucide-react";
import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
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

/** Datos descriptivos de la unidad: características, certificado y texto libre. */
export function FichaDatos({ ficha }: { ficha: FichaPropiedad }) {
  const u = ficha.unidad as Record<string, unknown>;
  const e = (ficha.edificio ?? {}) as Record<string, unknown>;
  const caducidad = fecha(String(u.certificado_caducidad ?? ""));

  return (
    <div className="space-y-6">
      <SeccionFicha icono={ZapIcon} titulo="Características">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <DatoFicha etiqueta="Planta" valor={u.planta != null ? String(u.planta) : "—"} />
          <DatoFicha etiqueta="Amueblado" valor={si(u.amueblado)} />
          <DatoFicha etiqueta="Terraza" valor={si(u.terraza)} />
          <DatoFicha etiqueta="Admite mascotas" valor={si(u.admite_mascotas)} />
          <DatoFicha etiqueta="Ascensor" valor={si(e.ascensor)} />
          <DatoFicha etiqueta="Año de construcción" valor={e.anio_construccion ? String(e.anio_construccion) : "—"} />
        </dl>
      </SeccionFicha>

      <SeccionFicha titulo="Certificado y referencias">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <DatoFicha
            etiqueta="Certificado energético"
            valor={u.certificado_energetico ? <EtiquetaEnergia letra={String(u.certificado_energetico)} caducidad={caducidad} /> : "—"}
          />
          <DatoFicha etiqueta="Ref. catastral" valor={<span className="font-mono text-xs">{String(u.referencia_catastral ?? "—")}</span>} />
          <DatoFicha etiqueta="Disponible desde" valor={fecha(String(u.fecha_disponible ?? ""))} />
        </dl>
      </SeccionFicha>

      {u.descripcion ? (
        <SeccionFicha titulo="Descripción">
          <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">{String(u.descripcion)}</p>
        </SeccionFicha>
      ) : null}
    </div>
  );
}
