"use client";

import { usePathname, useRouter } from "next/navigation";
import { useChatAcciones, useChatHistorial } from "@/components/chat-provider";
import { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";

/** Cuántas conversaciones recientes se listan bajo «Asistente»; las demás quedan en el historial del chat. */
const RECIENTES = 6;

/** Últimas conversaciones bajo «Asistente»: pulsar una la abre en el chat desde cualquier pantalla. */
export function SidebarConversaciones() {
  const { conversaciones, conversacionId } = useChatHistorial();
  const { abrir } = useChatAcciones();
  const pathname = usePathname();
  const router = useRouter();
  if (conversaciones.length === 0) return null;

  const abrirConversacion = (id: string) => {
    abrir(id);
    if (pathname !== "/dashboard/chat") router.push("/dashboard/chat");
  };

  return (
    <SidebarMenuSub>
      {conversaciones.slice(0, RECIENTES).map((c) => (
        <SidebarMenuSubItem key={c.id}>
          <SidebarMenuSubButton
            render={<button type="button" />}
            isActive={c.id === conversacionId}
            onClick={() => abrirConversacion(c.id)}
            title={c.titulo}
            className="w-full text-left"
          >
            <span>{c.titulo}</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  );
}
