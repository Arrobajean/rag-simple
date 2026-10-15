import { Badge } from "@/components/ui/badge";
import { SeccionFicha } from "@/components/propiedades/ficha-seccion";
import type { FichaPropiedad } from "@/lib/types";

type Persona = { rol: string; nombre: string; telefono: unknown; email: unknown };

/** Inquilino del contrato vigente y propietario de la unidad, con su rol y datos de contacto. */
export function FichaPersonas({ ficha }: { ficha: FichaPropiedad }) {
  const personas: Persona[] = [];
  const inquilino = ficha.contrato_vigente?.inquilino;
  if (inquilino) personas.push({ rol: "Inquilino", nombre: String(inquilino.nombre), telefono: inquilino.telefono, email: inquilino.email });
  if (ficha.propietario) personas.push({ rol: "Propietario", nombre: String(ficha.propietario.nombre), telefono: ficha.propietario.telefono, email: ficha.propietario.email });

  return (
    <SeccionFicha id="personas" titulo="Personas">
      {personas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin personas vinculadas.</p>
      ) : (
        <ul className="divide-y">
          {personas.map((p) => (
            <li key={p.rol} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {[p.telefono ? String(p.telefono) : null, p.email ? String(p.email) : null].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px] font-medium">{p.rol}</Badge>
            </li>
          ))}
        </ul>
      )}
    </SeccionFicha>
  );
}
