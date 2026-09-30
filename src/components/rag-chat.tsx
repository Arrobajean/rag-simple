"use client";

import * as React from "react";
import {
  SendIcon,
  BotIcon,
  UserIcon,
  SparklesIcon,
  Loader2Icon,
  Trash2Icon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MatchItem {
  id: number;
  source: string;
  content: string;
  similarity: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  matches?: MatchItem[];
  timestamp: string;
}

const SUGGESTIONS = [
  "¿Cuántos días de vacaciones tengo?",
  "¿Cuáles son las políticas de la empresa?",
  "¿Qué documentos están disponibles?",
];

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function RagChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente RAG. Pregúntame cualquier cosa sobre los documentos indexados en tu base de datos de Supabase.",
      timestamp: "Ahora",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [expandedMatches, setExpandedMatches] = React.useState<Record<string, boolean>>({});
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: q,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la respuesta");
      }

      const botMessage: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.answer || "No se pudo generar respuesta.",
        matches: data.matches || [],
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content: `⚠️ Hubo un problema al procesar la consulta: ${message}`,
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMatches = (msgId: string) => {
    setExpandedMatches((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Conversación reiniciada. ¿En qué puedo ayudarte?",
        timestamp: "Ahora",
      },
    ]);
  };

  return (
    <Card className="flex flex-col h-[700px] border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <SparklesIcon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Asistente RAG Interactivo
              <Badge variant="outline" className="text-xs font-normal border-green-500/40 text-green-600 bg-green-50/50 dark:bg-green-950/20">
                Online
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Recuperación con pgvector (768d) y síntesis con Gemini Flash
            </CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          title="Limpiar chat"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-4 mr-1" />
          Limpiar
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <BotIcon className="size-4" />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-muted/70 text-foreground border rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[11px] text-muted-foreground">{m.timestamp}</span>

                  {!isUser && m.matches && m.matches.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMatches(m.id)}
                      className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <BookOpenIcon className="size-3 mr-1" />
                      {m.matches.length} fuente{m.matches.length > 1 ? "s" : ""}
                      {expandedMatches[m.id] ? (
                        <ChevronUpIcon className="size-3 ml-1" />
                      ) : (
                        <ChevronDownIcon className="size-3 ml-1" />
                      )}
                    </Button>
                  )}
                </div>

                {!isUser && expandedMatches[m.id] && m.matches && (
                  <div className="mt-2 w-full space-y-2 p-3 bg-muted/40 border rounded-lg text-xs">
                    <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      Fragmentos recuperados de Supabase
                    </p>
                    {m.matches.map((match) => (
                      <div key={match.id} className="p-2 bg-background/80 rounded border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">[{match.source}]</span>
                          <Badge variant="secondary" className="text-[10px] h-4">
                            Similitud: {(match.similarity * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-3 italic">
                          &ldquo;{match.content}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="size-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon className="size-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BotIcon className="size-4" />
            </div>
            <div className="p-3 bg-muted/50 rounded-2xl border flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin text-primary" />
              Buscando vectores y generando respuesta...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="flex-col gap-2 p-3 border-t bg-card">
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-1.5 w-full">
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSend(sug)}
                className="text-xs bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre los documentos..."
            aria-label="Escribe tu pregunta sobre los documentos"
            disabled={loading}
            className="flex-1 h-10 px-3.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
          />
          <Button type="submit" disabled={!input.trim() || loading} size="default">
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
            <span className="hidden sm:inline ml-1">Preguntar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
