import { SECCIONES_FICHA, type SeccionId } from "@/lib/ficha";
import { cn } from "@/lib/utils";

/** Índice de anclas: columna lateral en escritorio y fila desplazable en móvil. */
export function FichaIndice({
  activa,
  cuentas,
  onIr,
}: {
  activa: string;
  cuentas: Partial<Record<SeccionId, number>>;
  onIr: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Secciones de la ficha"
      className="flex gap-1 overflow-x-auto border-b p-2 sm:w-44 sm:shrink-0 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0 sm:p-3"
    >
      {SECCIONES_FICHA.map((s) => {
        const cuenta = cuentas[s.id];
        const esActiva = activa === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onIr(s.id)}
            aria-current={esActiva ? "location" : undefined}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-1.5 text-left text-sm whitespace-nowrap transition-colors",
              esActiva ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {s.etiqueta}
            {cuenta ? <span className="text-xs tabular-nums">{cuenta}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
