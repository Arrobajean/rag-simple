"use client";

import { SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfiguracion } from "@/hooks/use-configuracion";
import { usePerfil } from "@/hooks/use-perfil";
import { useSesion } from "@/hooks/use-sesion";
import { etiquetaRol, iniciales } from "@/lib/perfil";

/** Pie del sidebar: avatar, nombre, rol y acceso a la configuración. Si la sesión es de LinkedIn, toma su nombre y foto. */
export function SidebarUsuario() {
  const { rol, abierto, nombre: nombreSesion, conFoto } = useSesion();
  const { nombre: nombreLocal } = usePerfil();
  const { abrir } = useConfiguracion();
  const nombre = nombreSesion || nombreLocal;

  return (
    <div className="flex items-center gap-2.5 rounded-lg p-1">
      <Avatar className="size-9 border">
        {conFoto && <AvatarImage src="/api/auth/avatar" alt={nombre} />}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{iniciales(nombre)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">{nombre}</p>
        <p className="truncate text-[11px] text-muted-foreground">{etiquetaRol(rol, abierto)}</p>
      </div>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={abrir} aria-label="Configuración" />}>
          <SettingsIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Configuración</TooltipContent>
      </Tooltip>
    </div>
  );
}
