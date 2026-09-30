"use client";

import * as React from "react";
import {
  FileTextIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCwIcon,
  Loader2Icon,
  UploadCloudIcon,
  CheckCircle2Icon,
  DatabaseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DocInfo {
  source: string;
  count: number;
  previews: string[];
}

interface RagDocumentsProps {
  onUpdate?: () => void;
}

export function RagDocuments({ onUpdate }: RagDocumentsProps) {
  const [docs, setDocs] = React.useState<DocInfo[]>([]);
  const [totalChunks, setTotalChunks] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Form states
  const [isAdding, setIsAdding] = React.useState<boolean>(false);
  const [sourceName, setSourceName] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [indexing, setIndexing] = React.useState<boolean>(false);
  const [deletingSource, setDeletingSource] = React.useState<string | null>(null);

  const fetchDocs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando documentos");
      setDocs(data.documents || []);
      setTotalChunks(data.totalChunks || 0);
      onUpdate?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar documentos";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  React.useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text || "");
    };
    reader.readAsText(file);
  };

  const handleIndexDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (indexing) return;
    if (!sourceName.trim() || !content.trim()) {
      toast.error("Por favor completa el nombre y el contenido");
      return;
    }

    setIndexing(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceName.trim(), content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al indexar");

      toast.success(`¡Documento '${data.source}' indexado! (${data.chunksCreated} fragmentos)`);
      setSourceName("");
      setContent("");
      setIsAdding(false);
      fetchDocs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al indexar";
      toast.error(msg);
    } finally {
      setIndexing(false);
    }
  };

  const handleDelete = async (source: string) => {
    if (deletingSource) return;
    if (!confirm(`¿Eliminar todos los fragmentos del documento '${source}' de Supabase?`)) {
      return;
    }

    setDeletingSource(source);
    try {
      const res = await fetch(`/api/documents?source=${encodeURIComponent(source)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      toast.success(`Documento '${source}' eliminado de la base de datos.`);
      fetchDocs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar";
      toast.error(msg);
    } finally {
      setDeletingSource(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Base de Documentos & Vectores</h2>
          <p className="text-sm text-muted-foreground">
            {docs.length} documentos indexados ({totalChunks} fragmentos vectorizados en Supabase)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocs} disabled={loading}>
            <RefreshCwIcon className={`size-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
            <PlusIcon className="size-4 mr-1.5" />
            {isAdding ? "Cancelar" : "Indexar Documento"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-primary/30 shadow-md transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UploadCloudIcon className="size-5 text-primary" />
              Indexar Nuevo Documento en pgvector
            </CardTitle>
            <CardDescription className="text-xs">
              El texto se dividirá en fragmentos, se generarán embeddings de 768d con Gemini y se guardarán en Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIndexDocument} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="doc-source-input" className="text-xs font-semibold text-foreground">
                    Nombre de la fuente (archivo)
                  </label>
                  <input
                    id="doc-source-input"
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="ej. politicas_empresa.md"
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="doc-file-input" className="text-xs font-semibold text-foreground">
                    O sube un archivo (.txt, .md)
                  </label>
                  <input
                    id="doc-file-input"
                    type="file"
                    accept=".txt,.md"
                    aria-label="Seleccionar archivo .txt o .md"
                    onChange={handleFileUpload}
                    className="w-full h-9 px-2 py-1 rounded-md border bg-background text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="doc-content-textarea" className="text-xs font-semibold text-foreground">
                  Contenido del documento
                </label>
                <textarea
                  id="doc-content-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pega aquí el contenido del documento para indexarlo..."
                  rows={6}
                  className="w-full p-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={indexing}>
                  {indexing ? (
                    <>
                      <Loader2Icon className="size-4 mr-2 animate-spin" />
                      Vectorizando con Gemini...
                    </>
                  ) : (
                    <>
                      <CheckCircle2Icon className="size-4 mr-2" />
                      Indexar en Supabase
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && docs.length === 0 ? (
        <div className="flex justify-center items-center py-16 text-muted-foreground text-sm gap-2">
          <Loader2Icon className="size-5 animate-spin text-primary" />
          Consultando base de datos en Supabase...
        </div>
      ) : docs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <DatabaseIcon className="size-6" />
            </div>
            <h3 className="font-semibold text-base">No hay documentos indexados</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Comienza agregando un documento con el botón &ldquo;Indexar Documento&rdquo; o ejecutando <code className="text-xs bg-muted px-1.5 py-0.5 rounded">python ingest.py</code> en tu terminal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <Card key={doc.source} className="border shadow-xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5 break-all">
                    <FileTextIcon className="size-4 text-primary shrink-0" />
                    {doc.source}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {doc.count} fragmento{doc.count > 1 ? "s" : ""} vectorial{doc.count > 1 ? "es" : ""}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                  disabled={deletingSource === doc.source}
                  onClick={() => handleDelete(doc.source)}
                  title="Eliminar de Supabase"
                  aria-label={`Eliminar documento ${doc.source}`}
                >
                  {deletingSource === doc.source ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Vista previa de fragmentos:
                </div>
                {doc.previews.map((prev, idx) => (
                  <div key={`${doc.source}-preview-${idx}`} className="p-2 rounded bg-muted/50 border text-muted-foreground line-clamp-2 italic">
                    &ldquo;{prev}&rdquo;
                  </div>
                ))}
                <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Supabase pgvector</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    768 dimensiones
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
