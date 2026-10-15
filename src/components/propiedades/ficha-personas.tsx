import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import type { FichaPropiedad } from "@/lib/types";

type Persona = { rol: string; nombre: string; telefono: unknown };

/** Inquilino del contrato vigente y propietario de la unidad, con su rol y teléfono. */
export function FichaPersonas({ ficha }: { ficha: FichaPropiedad }) {
  const personas: Persona[] = [];
  const inquilino = ficha.contrato_vigente?.inquilino;
  if (inquilino) personas.push({ rol: "Inquilino", nombre: String(inquilino.nombre), telefono: inquilino.telefono });
  if (ficha.propietario) personas.push({ rol: "Propietario", nombre: String(ficha.propietario.nombre), telefono: ficha.propietario.telefono });

  return (
    <SeccionFicha id="personas" titulo="Personas">
      {personas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin personas vinculadas.</p>
      ) : (
        <ul className="divide-y">
          {personas.map((p) => (
            <li key={p.rol} className="py-2.5">
              <p className="text-sm font-semibold">{p.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {p.rol} · {p.telefono ? String(p.telefono) : "sin teléfono"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SeccionFicha>
  );
}
