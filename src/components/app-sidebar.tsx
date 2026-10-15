"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon, BookOpenIcon, Building2Icon, FileTextIcon, HistoryIcon, LayoutDashboardIcon, LifeBuoyIcon, MessageSquareIcon, ScanTextIcon, SendIcon, SettingsIcon, SlidersHorizontalIcon, StarIcon, UsersIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { SidebarUsuario } from "@/components/sidebar-usuario";
import { SoporteDialog } from "@/components/soporte-dialog";
import { useConfiguracion } from "@/hooks/use-configuracion";
import { useSesion } from "@/hooks/use-sesion";
import type { TipoSoporte } from "@/lib/types";

type Accion = "configuracion" | TipoSoporte;

interface Item {
  titulo: string;
  icono: React.ComponentType<{ className?: string }>;
  href?: string;
  accion?: Accion;
  exacto?: boolean;
  badge?: string;
  /** Páginas reservadas a administradores: se ocultan a quien no lo sea. */
  soloAdmin?: boolean;
}

const GRUPOS: { etiqueta: string; items: Item[] }[] = [
  {
    etiqueta: "Gestión",
    items: [
      { titulo: "Panel", href: "/dashboard", icono: LayoutDashboardIcon, exacto: true },
      { titulo: "Asistente", href: "/dashboard/chat", icono: MessageSquareIcon, badge: "IA" },
      { titulo: "Propiedades", href: "/dashboard/propiedades", icono: Building2Icon },
      { titulo: "Alertas", href: "/dashboard/alertas", icono: BellIcon },
      { titulo: "Clientes", href: "/dashboard/clientes", icono: UsersIcon },
    ],
  },
  {
    etiqueta: "Documentos",
    items: [
      { titulo: "Documentos", href: "/dashboard/documentos", icono: FileTextIcon },
      { titulo: "Lector de contratos", href: "/dashboard/lector", icono: ScanTextIcon },
    ],
  },
  {
    etiqueta: "Administración",
    items: [
      { titulo: "Campos del catálogo", href: "/dashboard/campos", icono: SlidersHorizontalIcon },
      { titulo: "Valoraciones", href: "/dashboard/valoraciones", icono: StarIcon, soloAdmin: true },
      { titulo: "Accesos", href: "/dashboard/accesos", icono: HistoryIcon, soloAdmin: true },
      { titulo: "Soporte y feedback", href: "/dashboard/soporte", icono: LifeBuoyIcon, soloAdmin: true },
    ],
  },
  {
    etiqueta: "Recursos",
    items: [
      { titulo: "Documentación", href: "/dashboard/documentacion", icono: BookOpenIcon },
      { titulo: "Configuración", accion: "configuracion", icono: SettingsIcon },
      { titulo: "Soporte", accion: "soporte", icono: LifeBuoyIcon },
      { titulo: "Feedback", accion: "feedback", icono: SendIcon },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { abrir: abrirConfiguracion } = useConfiguracion();
  const { esAdmin, rol } = useSesion();
  const [dialogo, setDialogo] = React.useState<TipoSoporte | null>(null);
  // Cambia en cada apertura para remontar el diálogo y vaciar el formulario
  const [apertura, setApertura] = React.useState(0);
  const activo = (href: string, exacto?: boolean) => (exacto ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const ejecutar = React.useCallback(
    (accion: Accion) => {
      if (accion === "configuracion") {
        abrirConfiguracion();
      } else {
        setApertura((n) => n + 1);
        setDialogo(accion);
      }
    },
    [abrirConfiguracion]
  );

  // Oculta las páginas de administración a quien no sea admin (mientras se desconoce el rol se muestran)
  const grupos = GRUPOS.map((g) => ({ ...g, items: g.items.filter((it) => !it.soloAdmin || !rol || esAdmin) })).filter((g) => g.items.length > 0);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Building2Icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Gestión inmobiliaria</span>
            <span className="text-[11px] text-muted-foreground">Comunidad de Madrid</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {grupos.map((g, i) => (
          <SidebarGroup key={g.etiqueta} className={i === grupos.length - 1 ? "mt-auto" : undefined}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">{g.etiqueta}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {g.items.map((it) => (
                  <SidebarMenuItem key={it.titulo}>
                    <SidebarMenuButton
                      isActive={it.href ? activo(it.href, it.exacto) : false}
                      onClick={it.accion ? () => ejecutar(it.accion!) : undefined}
                      render={it.href ? <Link href={it.href} /> : undefined}
                      className="font-medium"
                    >
                      <it.icono className="size-4" />
                      <span>{it.titulo}</span>
                      {it.badge && (
                        <Badge variant="outline" className="ml-auto h-4 border-primary/30 px-1 text-[10px] text-primary">
                          {it.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t p-3">
        <SidebarUsuario />
        <p className="px-1 text-[10px] leading-snug text-muted-foreground">Datos de demostración sintéticos. Respuestas legales orientativas.</p>
      </SidebarFooter>

      <SoporteDialog
        key={apertura}
        tipo={dialogo ?? "soporte"}
        abierto={dialogo !== null}
        onCambiarAbierto={(v) => {
          if (!v) setDialogo(null);
        }}
      />
    </Sidebar>
  );
}
