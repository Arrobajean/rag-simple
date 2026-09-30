"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { AICitation } from "@/components/ui/ai-citation";
import { FileKindIcon } from "@/components/documents/file-kind";
import { enlazarCitas, esCita, etiquetaFuente, extracto, idDeCita } from "@/lib/citations";
import type { FuenteDocumento } from "@/lib/chat/types";

/** Respuesta en Markdown (listas, tablas) con las citas [F1] convertidas en píldoras que abren el documento. */
export function CitedMarkdown({ text, fuentes = [] }: { text: string; fuentes?: FuenteDocumento[] }) {
  const contenido = React.useMemo(() => enlazarCitas(text, fuentes), [text, fuentes]);
  const porId = React.useMemo(() => new Map(fuentes.map((f) => [f.id, f])), [fuentes]);

  const components: Components = React.useMemo(
    () => ({
      a: ({ href, children }) => {
        if (esCita(href)) {
          const f = porId.get(idDeCita(href!));
          if (!f) return <>{children}</>;
          return (
            <AICitation
              className="mx-0.5 align-baseline"
              label={f.id.replace("F", "")}
              title={etiquetaFuente(f)}
              subtitle={f.vigente ? `${f.tipo.replace(/_/g, " ")}` : "Versión sustituida"}
              description={extracto(f.contenido)}
              url={`/dashboard/documentos/${f.documento_id}${f.pagina ? `?pagina=${f.pagina}` : ""}`}
              favicon={<FileKindIcon source={f.titulo} />}
            />
          );
        }
        return (
          <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
            {children}
          </a>
        );
      },
      p: ({ children }) => <p className="leading-relaxed [&:not(:first-child)]:mt-2">{children}</p>,
      ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      table: ({ children }) => (
        <div className="my-2 overflow-x-auto rounded-md border">
          <table className="w-full text-xs">{children}</table>
        </div>
      ),
      th: ({ children }) => <th className="border-b bg-muted/50 px-2 py-1.5 text-left font-medium">{children}</th>,
      td: ({ children }) => <td className="border-b px-2 py-1.5 last:border-b-0">{children}</td>,
      code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>,
      blockquote: ({ children }) => <blockquote className="my-2 border-l-2 pl-3 text-muted-foreground italic">{children}</blockquote>,
      h1: ({ children }) => <h3 className="mt-3 mb-1 text-sm font-semibold">{children}</h3>,
      h2: ({ children }) => <h3 className="mt-3 mb-1 text-sm font-semibold">{children}</h3>,
      h3: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-semibold">{children}</h4>,
    }),
    [porId]
  );

  return (
    <div className="text-sm break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={(u) => (u.startsWith("cita:") ? u : u)}>
        {contenido}
      </ReactMarkdown>
    </div>
  );
}
