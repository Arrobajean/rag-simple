"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, RotateCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  texto: string;
  onReintentar?: () => void;
  onVoto?: (voto: "up" | "down") => void;
}

function Accion({ etiqueta, activo, onClick, children }: { etiqueta: string; activo?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <motion.button
            type="button"
            onClick={onClick}
            aria-label={etiqueta}
            aria-pressed={activo}
            whileTap={{ scale: 0.85 }}
            className={cn("flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", activo && "text-foreground")}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{etiqueta}</TooltipContent>
    </Tooltip>
  );
}

/** Acciones bajo cada respuesta: copiar, valorar y volver a generar. */
export function MensajeAcciones({ texto, onReintentar, onVoto }: Props) {
  const [copiado, setCopiado] = React.useState(false);
  const [voto, setVoto] = React.useState<"up" | "down" | null>(null);

  const copiar = async () => {
    await navigator.clipboard.writeText(texto).catch(() => undefined);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  };
  const votar = (v: "up" | "down") => {
    setVoto((actual) => (actual === v ? null : v));
    onVoto?.(v);
  };

  return (
    <div className="-ml-2 flex items-center gap-0.5 opacity-70 transition-opacity focus-within:opacity-100 hover:opacity-100">
      <Accion etiqueta={copiado ? "Copiado" : "Copiar respuesta"} onClick={copiar}>
        {copiado ? <CheckIcon className="size-4 text-emerald-500" /> : <CopyIcon className="size-4" />}
      </Accion>
      {onVoto && (
        <>
          <Accion etiqueta="Respuesta útil" activo={voto === "up"} onClick={() => votar("up")}>
            <ThumbsUpIcon className={cn("size-4", voto === "up" && "fill-current")} />
          </Accion>
          <Accion etiqueta="Respuesta mejorable" activo={voto === "down"} onClick={() => votar("down")}>
            <ThumbsDownIcon className={cn("size-4", voto === "down" && "fill-current")} />
          </Accion>
        </>
      )}
      {onReintentar && (
        <Accion etiqueta="Volver a generar" onClick={onReintentar}>
          <RotateCcwIcon className="size-4" />
        </Accion>
      )}
    </div>
  );
}
