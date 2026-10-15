import { AILoader } from "@/components/ui/ai-loader";

/** Mientras el asistente trabaja: animación de puntos y una pista breve de qué está haciendo. */
export function ChatThinking({ etiqueta = "Pensando" }: { etiqueta?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
      <AILoader variant="dots" className="shrink-0 text-primary" />
      <span className="truncate">{etiqueta}…</span>
    </div>
  );
}
