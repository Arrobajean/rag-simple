import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GithubIcon } from "@/components/icons";

interface SiteHeaderProps {
  activeTab?: string;
}

export function SiteHeader({ activeTab = "chat" }: SiteHeaderProps) {
  const titles: Record<string, string> = {
    chat: "Asistente RAG",
    documents: "Documentos & Vectores",
    analytics: "Métricas & Análisis",
    table: "Tabla de Registros",
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b px-4 lg:px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">rag-simple</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{titles[activeTab] || "Dashboard"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden sm:inline-flex text-xs font-normal text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
        >
          ● Supabase pgvector Activo
        </Badge>
        <a
          href="https://github.com/Arrobajean/rag-simple"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1 transition-colors bg-card hover:bg-muted"
        >
          <GithubIcon className="size-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
