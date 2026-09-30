import { AILoader } from "@/components/ui/ai-loader";
import { ChatAvatar } from "@/components/chat/chat-message";
import type { FaseChat } from "@/lib/chat-fase";

/**
 * Estado en curso del asistente: una línea discreta con puntos animados y el tiempo transcurrido.
 * Con `conAvatar` (primer mensaje, sin nada más visible) lleva el avatar del asistente.
 */
export function ChatThinking({ fase, conAvatar = false }: { fase: FaseChat; conAvatar?: boolean }) {
  return (
    <div className={conAvatar ? "flex items-start gap-2.5" : "max-w-[92%] pl-[42px] md:max-w-[80%]"} aria-live="polite">
      {conAvatar && <ChatAvatar role="assistant" />}
      <div className="min-w-0 pt-1.5">
        <AILoader key={fase.etiqueta} label={`${fase.etiqueta}…`} variant="dots" showElapsed className="text-sm font-medium text-muted-foreground" />
        {fase.detalle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{fase.detalle}</p>}
      </div>
    </div>
  );
}
