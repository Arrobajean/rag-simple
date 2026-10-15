"use client";

import { Trash2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useChatAcciones, useChatHistorial } from "@/components/chat-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { useConfirmacion } from "@/hooks/use-confirmacion";
import { TEXTOS_BORRAR_CONVERSACION } from "@/lib/chat-historial";

/** Cuántas conversaciones recientes se listan bajo «Asistente»; las demás quedan en el historial del chat. */
const RECIENTES = 3;

/** Últimas conversaciones bajo «Asistente»: pulsar una la abre en el chat desde cualquier pantalla; la papelera la borra. */
export function SidebarConversaciones() {
  const { conversaciones, conversacionId } = useChatHistorial();
  const { abrir, borrar } = useChatAcciones();
  const confirmacion = useConfirmacion();
  const pathname = usePathname();
  const router = useRouter();
  if (conversaciones.length === 0) return null;

  const abrirConversacion = (id: string) => {
    abrir(id);
    if (pathname !== "/dashboard/chat") router.push("/dashboard/chat");
  };

  const pedirBorrar = (id: string) => confirmacion.pedir({ ...TEXTOS_BORRAR_CONVERSACION, onConfirmar: () => borrar(id) });

  return (
    <>
      <SidebarMenuSub>
        {conversaciones.slice(0, RECIENTES).map((c) => (
          <SidebarMenuSubItem key={c.id}>
            <SidebarMenuSubButton
              render={<button type="button" />}
              isActive={c.id === conversacionId}
              onClick={() => abrirConversacion(c.id)}
              title={c.titulo}
              className="w-full pr-7 text-left"
            >
              <span>{c.titulo}</span>
            </SidebarMenuSubButton>
            <button
              type="button"
              aria-label={`Borrar «${c.titulo}»`}
              onClick={() => pedirBorrar(c.id)}
              className="absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground/60 opacity-60 outline-none transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring md:opacity-0 md:group-hover/menu-sub-item:opacity-100"
            >
              <Trash2Icon className="size-3.5" />
            </button>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
      <ConfirmDialog {...confirmacion.dialogo} />
    </>
  );
}
