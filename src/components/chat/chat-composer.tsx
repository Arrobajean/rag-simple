"use client";

import * as React from "react";
import { ArrowUpIcon, CheckIcon, CopyIcon, DownloadIcon, PlusIcon, SquarePenIcon, SquareIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextMeter } from "@/components/chat/context-meter";
import type { ContextoChat } from "@/lib/chat-contexto";
import { cn } from "@/lib/utils";

interface Props {
  loading: boolean;
  hayConversacion: boolean;
  contexto?: ContextoChat;
  onSend: (question: string) => void;
  onStop: () => void;
  onNueva: () => void;
  onCopiar: () => void;
  onDescargar: () => void;
}

const MAX_ALTO_PX = 200;

/** Campo de texto del asistente al estilo de los chats actuales: crece con el texto, Enter envía, Mayús+Enter salta de línea. */
export function ChatComposer({ loading, hayConversacion, contexto, onSend, onStop, onNueva, onCopiar, onDescargar }: Props) {
  const [texto, setTexto] = React.useState("");
  const [copiado, setCopiado] = React.useState(false);
  const area = React.useRef<HTMLTextAreaElement>(null);
  const reducir = useReducedMotion();
  const puedeEnviar = texto.trim().length > 0 && !loading;

  // Ajusta el alto al contenido (hasta un máximo)
  React.useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ALTO_PX)}px`;
  }, [texto]);

  const enviar = () => {
    if (!puedeEnviar) return;
    onSend(texto);
    setTexto("");
  };

  const copiar = () => {
    onCopiar();
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <div
      className={cn(
        "group/composer flex items-end gap-1.5 rounded-[28px] border bg-muted/50 p-1.5 shadow-xs transition-all duration-200",
        "focus-within:border-foreground/20 focus-within:bg-muted/70 focus-within:shadow-md"
      )}
    >
      <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  aria-label="Más opciones"
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[popup-open]:bg-foreground/10 data-[popup-open]:text-foreground"
                />
              }
            >
              <PlusIcon className="size-5 transition-transform duration-200 group-has-[[data-popup-open]]/composer:rotate-45" />
            </TooltipTrigger>
            <TooltipContent>Más opciones</TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="top" align="start" className="w-60">
            <DropdownMenuItem onClick={onNueva}>
              <SquarePenIcon /> Nueva conversación
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!hayConversacion} onClick={copiar}>
              {copiado ? <CheckIcon /> : <CopyIcon />} Copiar conversación
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!hayConversacion} onClick={onDescargar}>
              <DownloadIcon /> Descargar como Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>

      <textarea
        ref={area}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            enviar();
          }
          if (e.key === "Escape" && loading) onStop();
        }}
        rows={1}
        placeholder="Pregunta por propiedades, contratos, cobros o documentos"
        aria-label="Escribe tu pregunta"
        className="block max-h-[200px] min-w-0 flex-1 resize-none bg-transparent px-1 py-1.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground/70"
      />

      <div className="flex items-center gap-2">
          {contexto && contexto.llamadas > 0 && <ContextMeter contexto={contexto} />}

          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.button
                key="parar"
                type="button"
                onClick={onStop}
                aria-label="Detener respuesta (Esc)"
                title="Detener (Esc)"
                initial={reducir ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reducir ? undefined : { scale: 0.6, opacity: 0 }}
                whileTap={{ scale: 0.92 }}
                className="flex size-9 items-center justify-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SquareIcon className="size-3.5 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                key="enviar"
                type="button"
                onClick={enviar}
                disabled={!puedeEnviar}
                aria-label="Enviar (Enter)"
                title="Enviar (Enter)"
                initial={reducir ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: puedeEnviar ? 1 : 0.9, opacity: puedeEnviar ? 1 : 0.35 }}
                exit={reducir ? undefined : { scale: 0.6, opacity: 0 }}
                whileHover={puedeEnviar ? { scale: 1.08 } : undefined}
                whileTap={puedeEnviar ? { scale: 0.92 } : undefined}
                className="flex size-9 items-center justify-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowUpIcon className="size-[18px]" strokeWidth={2.4} />
              </motion.button>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}
