"use client";

import * as React from "react";
import { RotateCcwIcon, SendIcon, SquareIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContextMeter } from "@/components/chat/context-meter";
import type { ContextoChat } from "@/lib/chat-contexto";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatComposerProps {
  loading: boolean;
  suggestions?: string[];
  canClear?: boolean;
  contexto?: ContextoChat;
  onSend: (question: string) => void;
  onStop?: () => void;
  onClear?: () => void;
}

export function ChatComposer({
  loading,
  suggestions = [],
  canClear = false,
  contexto,
  onSend,
  onStop,
  onClear,
}: ChatComposerProps) {
  const [input, setInput] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Sugerencias iniciales o barra contextual con acción de limpiar */}
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 w-full">
          {suggestions.map((sug) => (
            <Button
              key={sug}
              variant="outline"
              size="sm"
              onClick={() => onSend(sug)}
              className="h-7 text-xs font-normal rounded-full text-muted-foreground hover:text-foreground"
            >
              {sug}
            </Button>
          ))}
        </div>
      ) : canClear && onClear ? (
        <div className="flex items-center justify-between w-full px-1 text-xs">
          {contexto && contexto.llamadas > 0 ? (
            <ContextMeter contexto={contexto} />
          ) : (
            <span className="text-[11px] text-muted-foreground">Consulta la cartera, los contratos y los documentos</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={loading}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-1.5"
          >
            <Trash2Icon className="size-3" />
            <span>Limpiar conversación</span>
          </Button>
        </div>
      ) : null}

      <form onSubmit={submit} className="flex w-full gap-2 items-center">
        {onClear && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onClear}
                  disabled={loading || !canClear}
                  className="size-10 shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
                  aria-label="Reiniciar conversación"
                />
              }
            >
              <RotateCcwIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Reiniciar conversación</TooltipContent>
          </Tooltip>
        )}

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta por propiedades, contratos, cobros, alertas o documentos…"
          aria-label="Escribe tu pregunta"
          disabled={loading}
          className="h-10 text-sm flex-1"
        />

        {loading && onStop ? (
          <Button type="button" variant="outline" onClick={onStop} className="h-10 px-4">
            <SquareIcon className="size-3.5" />
            <span className="ml-1.5 hidden sm:inline">Detener</span>
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim() || loading} className="h-10 px-4">
            <SendIcon className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Preguntar</span>
          </Button>
        )}
      </form>
    </div>
  );
}
