import { cn } from "@/lib/utils";

/** Cabecera e envoltorio comunes a todas las secciones de la ficha. */
export function SeccionFicha({
  icono: Icono,
  titulo,
  extra,
  children,
  className,
}: {
  icono?: React.ComponentType<{ className?: string }>;
  titulo: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-label={titulo} className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2">
        {Icono ? <Icono className="size-3.5 text-muted-foreground" /> : null}
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{titulo}</h3>
        {extra ? <span className="ml-auto text-xs text-muted-foreground">{extra}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** Par etiqueta/valor dentro de una rejilla de datos. */
export function DatoFicha({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium break-words">{valor ?? "—"}</dd>
    </div>
  );
}
