"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Contenedor de cada pantalla. Hay un scroll por pantalla, salvo en dos casos de altura fija:
 * el asistente (el campo de texto queda abajo) y el panel de inicio, que en escritorio cabe en la ventana sin scroll.
 */
export function DashboardContenido({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const pantallaCompleta = ruta === "/dashboard/chat";
  const panel = ruta === "/dashboard";
  return (
    <div
      className={cn(
        "min-h-0 flex-1",
        pantallaCompleta && "flex flex-col overflow-hidden",
        panel ? "flex flex-col overflow-y-auto lg:overflow-hidden" : !pantallaCompleta && "overflow-y-auto",
      )}
    >
      {pantallaCompleta ? (
        children
      ) : (
        <div className={cn("mx-auto flex w-full max-w-[112rem] flex-col gap-6 p-4 md:p-6 2xl:px-10", panel && "lg:min-h-0 lg:flex-1")}>{children}</div>
      )}
    </div>
  );
}
