import { AILoader } from "@/components/ui/ai-loader";
import type { FaseChat } from "@/lib/chat-fase";

/** Estado en curso del asistente: puntos animados, la fase y el tiempo transcurrido. */
export function ChatThinking({ fase }: { fase: FaseChat }) {
  return (
    <div aria-live="polite">
      <AILoader key={fase.etiqueta} label={`${fase.etiqueta}…`} variant="dots" showElapsed className="text-sm font-medium text-muted-foreground" />
      {fase.detalle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{fase.detalle}</p>}
    </div>
  );
}
