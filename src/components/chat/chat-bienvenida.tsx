"use client";

import { motion } from "motion/react";
import { AtlasOrb } from "@/components/chat/atlas-orb";
import { NOMBRE_ASISTENTE } from "@/lib/asistente";

/** Preguntas de ejemplo para arrancar; se envían tal cual al pulsarlas. */
const SUGERENCIAS = [
  "¿Cuántos pisos libres para alquilar hay en Madrid Sur?",
  "¿Cuál es el piso más caro de la cartera?",
  "¿Qué contratos vencen en los próximos 30 días?",
  "¿Se permiten mascotas en Calle de Toledo 45?",
];

/** Saludo sobre el campo de texto cuando la conversación está vacía. */
export function ChatBienvenida({ onEnviar }: { onEnviar: (pregunta: string) => void }) {
  return (
    <motion.div exit={{ opacity: 0, transition: { duration: 0.1 } }} className="mb-5 flex flex-col items-center gap-3 text-center">
      <AtlasOrb state="idle" size={96} etiqueta="Asistente en reposo" />
      <div className="space-y-1">
        <p className="text-2xl font-medium tracking-tight">Hola, soy {NOMBRE_ASISTENTE}</p>
        <p className="text-sm text-muted-foreground">Pregúntame por la cartera, los contratos o los clientes.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onEnviar(s)}
            className="rounded-full border bg-background px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
