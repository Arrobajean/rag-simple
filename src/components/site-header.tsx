import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/icons";

interface SiteHeaderProps {
  activeTab?: string;
}

export function SiteHeader({ activeTab = "chat" }: SiteHeaderProps) {
  const titles: Record<string, string> = {
    chat: "Asistente RAG & Chat",
    documents: "Gestión de Documentos",
    analytics: "Métricas del Vector Store",
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <span className="text-xs text-muted-foreground">rag-simple</span>
        <span className="text-xs text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold">{titles[activeTab] || "Dashboard"}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:inline-flex text-xs font-normal text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          ● Supabase Conectado
        </Badge>
        <a
          href="https://github.com/Arrobajean/rag-simple"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2.5 py-1 transition-colors"
        >
          <GithubIcon className="size-3.5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
