import { AlertCircleIcon, CheckIcon, DatabaseIcon, FileSearchIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EjecucionHerramienta } from "@/lib/chat/types";

const DE_DOCUMENTOS = new Set(["buscar_en_documentos"]);

function Icono({ paso }: { paso: EjecucionHerramienta }) {
  if (paso.estado === "ejecutando") return <Loader2Icon className="size-3 animate-spin text-primary" />;
  if (paso.estado === "error") return <AlertCircleIcon className="size-3 text-destructive" />;
  return <CheckIcon className="size-3 text-emerald-500" />;
}

/** Transparencia: qué consultó el asistente (base de datos o documentos) para responder. */
export function ToolSteps({ pasos }: { pasos: EjecucionHerramienta[] }) {
  if (pasos.length === 0) return null;
  return (
    <ul className="space-y-1" aria-label="Consultas realizadas">
      {pasos.map((p) => {
        const Tipo = DE_DOCUMENTOS.has(p.nombre) ? FileSearchIcon : DatabaseIcon;
        return (
          <li
            key={p.id}
            className={cn(
              "flex items-start gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 text-[11px] leading-snug",
              p.estado === "error" && "border-destructive/30 bg-destructive/5"
            )}
          >
            <Tipo className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground/90">{p.descripcion}</p>
              {p.resumen && <p className="truncate text-muted-foreground">{p.resumen}</p>}
            </div>
            <Icono paso={p} />
          </li>
        );
      })}
    </ul>
  );
}
