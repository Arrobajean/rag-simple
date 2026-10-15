import { usePreguntarAtlas } from "@/hooks/use-preguntar-atlas";
import { CONSULTAS_HOY } from "@/lib/panel-corredor";

/** Preguntas rápidas a Atlas sobre el día: cada chip envía su pregunta y abre el chat. */
export function ConsultasHoy() {
  const preguntar = usePreguntarAtlas();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Pregunta a Atlas sobre hoy</span>
      {CONSULTAS_HOY.map((c) => (
        <button
          key={c.etiqueta}
          type="button"
          onClick={() => preguntar(c.pregunta)}
          className="rounded-full border bg-background px-3 py-1 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          {c.etiqueta}
        </button>
      ))}
    </div>
  );
}
