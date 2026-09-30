"use client";

import { motion, useReducedMotion } from "motion/react";
import { SparklesIcon } from "lucide-react";
import { NOMBRE_ASISTENTE, SUGERENCIAS } from "@/lib/asistente";

/** Ideas para empezar, sobre el campo de texto, como en Gemini. */
export function ChatSugerencias({ onElegir }: { onElegir: (pregunta: string) => void }) {
  const reducir = useReducedMotion();
  return (
    <motion.div exit={{ opacity: 0, transition: { duration: 0.1 } }} className="mb-5 space-y-3">
      <div className="space-y-1 text-center">
        <p className="flex items-center justify-center gap-2 text-2xl font-medium tracking-tight">
          <SparklesIcon className="size-6 text-primary" /> Hola, soy {NOMBRE_ASISTENTE}
        </p>
        <p className="text-sm text-muted-foreground">¿Tienes nuevas ideas que explorar?</p>
      </div>
      <ul className="flex flex-wrap justify-center gap-2">
        {SUGERENCIAS.map((s, i) => (
          <motion.li
            key={s}
            initial={reducir ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <button
              type="button"
              onClick={() => onElegir(s)}
              className="rounded-full border bg-background px-3.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {s}
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
