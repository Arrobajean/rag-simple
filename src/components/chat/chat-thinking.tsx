import { AILoader } from "@/components/ui/ai-loader";
import { ChatAvatar } from "@/components/chat/chat-message";

export function ChatThinking() {
  return (
    <div className="flex gap-2.5 justify-start items-start">
      <div className="mt-0.5 shrink-0">
        <ChatAvatar role="assistant" />
      </div>
      <div className="rounded-2xl px-4 py-3 bg-muted/70 text-foreground border rounded-bl-xs flex flex-col gap-1.5 text-sm shadow-xs">
        <AILoader label="Pensando..." variant="dots" showElapsed className="text-foreground font-medium text-sm" />
        <span className="text-[11px] text-muted-foreground">
          Buscando en pgvector y sintetizando respuesta con Gemini...
        </span>
      </div>
    </div>
  );
}
