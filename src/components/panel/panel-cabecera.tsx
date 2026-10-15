"use client";

import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useFechaHoy, useSaludo } from "@/hooks/use-saludo";
import { cn } from "@/lib/utils";

/** Saludo, fecha y la entrada al asistente, en una sola línea. */
export function PanelCabecera() {
  const saludo = useSaludo();
  const fecha = useFechaHoy();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
        <h1 className="text-xl font-semibold tracking-tight">{saludo}</h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">{fecha}</p>
      </div>
      <Link href="/dashboard/chat" className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-2")}>
        <SparklesIcon className="size-4" /> Preguntar a Atlas
      </Link>
    </div>
  );
}
