"use client";

import * as React from "react";
import {
  MessageSquareIcon,
  FileTextIcon,
  DatabaseIcon,
  SparklesIcon,
  ExternalLinkIcon,
  BotIcon,
} from "lucide-react";
import { GithubIcon } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function AppSidebar({ activeTab = "chat", setActiveTab, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <SparklesIcon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">RAG Simple</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  Supabase + Gemini
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Navegación principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Plataforma
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "chat"}
                  onClick={() => setActiveTab?.("chat")}
                  className="cursor-pointer font-medium"
                >
                  <MessageSquareIcon className="size-4" />
                  <span>Asistente Chat</span>
                  <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1 border-primary/30 text-primary">
                    Live
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "documents"}
                  onClick={() => setActiveTab?.("documents")}
                  className="cursor-pointer font-medium"
                >
                  <FileTextIcon className="size-4" />
                  <span>Documentos & Vectores</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "analytics"}
                  onClick={() => setActiveTab?.("analytics")}
                  className="cursor-pointer font-medium"
                >
                  <DatabaseIcon className="size-4" />
                  <span>Métricas & pgvector</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Enlaces externos */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Recursos & Cloud
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href="https://github.com/Arrobajean/rag-simple"
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <GithubIcon className="size-4" />
                    <span>GitHub Repo</span>
                  </div>
                  <ExternalLinkIcon className="size-3 text-muted-foreground" />
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href="https://supabase.com/dashboard/project/ocyxzfaclmvasroirygd"
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <DatabaseIcon className="size-4 text-emerald-500" />
                    <span>Supabase Dashboard</span>
                  </div>
                  <ExternalLinkIcon className="size-3 text-muted-foreground" />
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href="https://aistudio.google.com"
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BotIcon className="size-4 text-blue-500" />
                    <span>Google AI Studio</span>
                  </div>
                  <ExternalLinkIcon className="size-3 text-muted-foreground" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-2.5 p-1 rounded-lg">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
            J
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">Jean Castaneda</span>
            <span className="text-[11px] text-muted-foreground truncate">Arrobajean</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
