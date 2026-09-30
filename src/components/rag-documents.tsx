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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
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
      setDialogOpen(false);
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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DatabaseIcon className="size-5 text-primary" />
            Base de Documentos & Vectores
          </CardTitle>
          <CardDescription className="text-xs">
            {docs.length} documentos indexados ({totalChunks} fragmentos vectorizados con pgvector)
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocs} disabled={loading} className="text-xs h-8">
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={<Button size="sm" className="text-xs h-8" />}
            >
              <PlusIcon className="size-3.5 mr-1.5" />
              Indexar Documento
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <UploadCloudIcon className="size-5 text-primary" />
                  Indexar Documento en Supabase
                </DialogTitle>
                <DialogDescription className="text-xs">
                  El documento se dividirá en fragmentos, se generarán embeddings de 768d con Gemini y se almacenarán en pgvector.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleIndexDocument} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="source-name-field" className="text-xs font-semibold">
                    Nombre del archivo o fuente:
                  </label>
                  <Input
                    id="source-name-field"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="ej. manual_empresa.md"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="file-upload-field" className="text-xs font-semibold">
                    O cargar archivo (.md, .txt):
                  </label>
                  <Input
                    id="file-upload-field"
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="cursor-pointer text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="doc-content-field" className="text-xs font-semibold">
                    Contenido del texto:
                  </label>
                  <Textarea
                    id="doc-content-field"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Pega aquí el contenido para indexarlo en el RAG..."
                    rows={6}
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={indexing}>
                    {indexing ? (
                      <>
                        <Loader2Icon className="size-3.5 mr-2 animate-spin" />
                        Vectorizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2Icon className="size-3.5 mr-2" />
                        Guardar e Indexar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading && docs.length === 0 ? (
          <div className="flex justify-center items-center py-12 text-muted-foreground text-sm gap-2">
            <Loader2Icon className="size-4 animate-spin text-primary" />
            Cargando documentos de Supabase...
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-10 space-y-2 border rounded-lg bg-muted/20">
            <p className="text-sm font-medium">No hay documentos indexados todavía</p>
            <p className="text-xs text-muted-foreground">
              Haz clic en &ldquo;Indexar Documento&rdquo; o ejecuta <code className="bg-muted px-1 rounded">python ingest.py</code>.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[200px]">Fuente</TableHead>
                  <TableHead className="w-[120px]">Fragmentos</TableHead>
                  <TableHead>Vista Previa</TableHead>
                  <TableHead className="text-right w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc) => (
                  <TableRow key={doc.source}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileTextIcon className="size-4 text-primary shrink-0" />
                      <span className="truncate max-w-[180px]">{doc.source}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {doc.count} chunk{doc.count > 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground italic line-clamp-1 max-w-[400px]">
                      &ldquo;{doc.previews[0] || ""}&rdquo;
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
