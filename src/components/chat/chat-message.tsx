import { BotIcon, UserIcon } from "lucide-react";
import { AIMessage } from "@/components/ui/ai-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSources } from "@/components/chat/message-sources";
import { CitedMarkdown } from "@/components/chat/cited-markdown";
import { ToolSteps } from "@/components/chat/tool-steps";
import { ToolResult } from "@/components/chat/tool-result";
import { ChatThinking } from "@/components/chat/chat-thinking";
import { faseDelMensaje } from "@/lib/chat-fase";
import type { ChatMessage as ChatMessageData } from "@/lib/types";

export function ChatAvatar({ role }: { role: ChatMessageData["role"] }) {
  const isUser = role === "user";
  return (
    <Avatar className="size-8 border">
      <AvatarFallback className={isUser ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"}>
        {isUser ? <UserIcon className="size-4" /> : <BotIcon className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

interface ChatMessageProps {
  message: ChatMessageData;
  onRetry?: () => void;
  onVote?: (vote: "up" | "down") => void;
}

export function ChatMessage({ message, onRetry, onVote }: ChatMessageProps) {
  const isUser = message.role === "user";
  const pasos = message.herramientas ?? [];
  const resultados = pasos.filter((p) => p.presentacion);
  const fase = faseDelMensaje(message);

  return (
    <div className="space-y-1.5">
      {!isUser && pasos.length > 0 && (
        <div className="max-w-[92%] pl-[42px] md:max-w-[80%]">
          <ToolSteps pasos={pasos} />
        </div>
      )}

      {(isUser || message.content) && (
        <AIMessage
          from={isUser ? "user" : "assistant"}
          timestamp={message.timestamp}
          copyText={message.content}
          onRetry={onRetry}
          onVote={onVote}
          avatar={<ChatAvatar role={message.role} />}
        >
          {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <CitedMarkdown text={message.content} fuentes={message.fuentes} />}
        </AIMessage>
      )}

      {fase && <ChatThinking fase={fase} conAvatar={pasos.length === 0 && !message.content} />}

      {!isUser && resultados.length > 0 && (
        <div className="max-w-[92%] space-y-2 pl-[42px] md:max-w-[80%]">
          {resultados.map((p) => (
            <ToolResult key={p.id} presentacion={p.presentacion!} />
          ))}
        </div>
      )}

      {!isUser && message.fuentes && message.fuentes.length > 0 && <MessageSources fuentes={message.fuentes} />}
    </div>
  );
}
