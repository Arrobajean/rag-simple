"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatComposer } from "@/components/chat/chat-composer";
import { useRagChat } from "@/hooks/use-rag-chat";

const SUGGESTIONS = [
  "¿Cuántos pisos libres hay en Madrid Sur?",
  "¿Qué contratos vencen en los próximos 30 días?",
  "¿Se permiten mascotas en Calle de Toledo 45?",
  "Muéstrame los impagos actuales",
];

const handleVote = (vote: "up" | "down") => toast(vote === "up" ? "Gracias por el feedback" : "Anotado, lo mejoraremos");

export function RagChat() {
  const { messages, loading, contexto, send, stop, questionFor, clear } = useRagChat();
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <Card className="flex h-[calc(100dvh-9.5rem)] min-h-[480px] flex-col shadow-sm">
      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((m, idx) => {
              const isReply = m.role === "assistant" && m.id !== "welcome" && !m.enCurso;
              const question = isReply ? questionFor(idx) : undefined;
              return <ChatMessage key={m.id} message={m} onRetry={question && !loading ? () => send(question) : undefined} onVote={isReply ? handleVote : undefined} />;
            })}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      <CardFooter className="flex-col gap-2 bg-card p-3">
        <ChatComposer loading={loading} suggestions={messages.length <= 2 ? SUGGESTIONS : []} canClear={messages.length > 1} contexto={contexto} onSend={send} onStop={stop} onClear={clear} />
      </CardFooter>
    </Card>
  );
}
