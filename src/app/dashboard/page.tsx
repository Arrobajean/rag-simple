"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RagChat } from "@/components/rag-chat";
import { RagDocuments } from "@/components/rag-documents";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState<string>("chat");
  const [docCount, setDocCount] = React.useState<number>(1);
  const [chunkCount, setChunkCount] = React.useState<number>(1);

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocCount(data.documents?.length || 0);
        setChunkCount(data.totalChunks || 0);
      }
    } catch {
      // Ignorar error inicial
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} variant="inset" />
      <SidebarInset>
        <SiteHeader activeTab={activeTab} />
        <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Métricas clave en tarjetas */}
          <SectionCards docCount={docCount} chunkCount={chunkCount} />

          {/* Vistas según pestaña activa */}
          {activeTab === "chat" && (
            <div className="px-4 lg:px-6">
              <RagChat />
            </div>
          )}

          {activeTab === "documents" && (
            <div className="px-4 lg:px-6">
              <RagDocuments onUpdate={fetchStats} />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="px-4 lg:px-6 space-y-6">
              <ChartAreaInteractive />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
