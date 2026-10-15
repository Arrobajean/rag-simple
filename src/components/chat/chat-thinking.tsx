import { AILoader } from "@/components/ui/ai-loader";
import { NOMBRE_ASISTENTE } from "@/lib/asistente";

/** Mientras el asistente trabaja: animación de puntos y un texto que explica qué está pasando. */
export function ChatThinking() {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
      <AILoader variant="dots" className="shrink-0 text-primary" />
      <span>{NOMBRE_ASISTENTE} está consultando tus datos…</span>
    </div>
  );
}
