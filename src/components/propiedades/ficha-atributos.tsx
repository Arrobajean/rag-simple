import { SparklesIcon } from "lucide-react";
import { DatoFicha, SeccionFicha } from "@/components/propiedades/ficha-seccion";
import { etiquetaAtributo, valorAtributo } from "@/lib/ficha";
import type { FichaPropiedad } from "@/lib/types";

/** Campos extra del catálogo definidos por administración, propios de la unidad o su contrato. */
export function FichaAtributos({ atributos }: { atributos: FichaPropiedad["atributos"] }) {
  const entradas = Object.entries(atributos).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entradas.length === 0) return null;
  return (
    <SeccionFicha icono={SparklesIcon} titulo="Datos adicionales">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {entradas.map(([clave, valor]) => (
          <DatoFicha key={clave} etiqueta={etiquetaAtributo(clave)} valor={valorAtributo(valor)} />
        ))}
      </dl>
    </SeccionFicha>
  );
}
