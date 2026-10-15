import { cn } from "@/lib/utils";

/** Título y envoltorio comunes a las secciones de la ficha. `id` es el ancla a la que apunta el índice. */
export function SeccionFicha({
  id,
  titulo,
  extra,
  children,
  className,
}: {
  id: string;
  titulo: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-label={titulo} className={cn("scroll-mt-5 space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">{titulo}</h3>
        {extra ? <span className="text-xs text-muted-foreground tabular-nums">{extra}</span> : null}
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
