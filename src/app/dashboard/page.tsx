"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RagChat } from "@/components/rag-chat";
import { RagDocuments } from "@/components/rag-documents";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { MessageSquareIcon, FileTextIcon, BarChart3Icon, TableIcon } from "lucide-react";
import tableData from "./data.json";

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
      // Ignorar error de carga inicial
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
          {/* Tarjetas KPI de Dashboard-01 */}
          <SectionCards docCount={docCount} chunkCount={chunkCount} />

          {/* Navegación por pestañas shadcn Tabs */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(String(val))} className="w-full space-y-6">
            <div className="px-4 lg:px-6">
              <TabsList className="bg-muted p-1 rounded-lg border">
                <TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <MessageSquareIcon className="size-4" />
                  <span>Asistente RAG</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <FileTextIcon className="size-4" />
                  <span>Documentos ({docCount})</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <BarChart3Icon className="size-4" />
                  <span>Métricas & Gráfica</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <TableIcon className="size-4" />
                  <span>Data Table</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Pestaña 1: Asistente RAG */}
            <TabsContent value="chat" className="px-4 lg:px-6 mt-0">
              <RagChat />
            </TabsContent>

            {/* Pestaña 2: Base de Documentos */}
            <TabsContent value="documents" className="px-4 lg:px-6 mt-0">
              <RagDocuments onUpdate={fetchStats} />
            </TabsContent>

            {/* Pestaña 3: Gráfica Interactiva de Dashboard-01 */}
            <TabsContent value="analytics" className="px-4 lg:px-6 mt-0 space-y-4">
              <ChartAreaInteractive />
            </TabsContent>

            {/* Pestaña 4: Data Table de Dashboard-01 */}
            <TabsContent value="table" className="px-4 lg:px-6 mt-0">
              <DataTable data={tableData} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
