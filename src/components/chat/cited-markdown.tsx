"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { AICitation } from "@/components/ui/ai-citation";
import { FileKindIcon } from "@/components/documents/file-kind";
import { enlazarCitas, enlazarReferencias, esCita, etiquetaFuente, extracto, idDeCita, normalizarEnlaceFicha } from "@/lib/citations";
import { useAbrirFicha } from "@/components/chat/ficha-context";
import type { FuenteDocumento } from "@/lib/chat/types";

/** Enlaces internos que abren una ficha lateral en lugar de navegar. */
const PROP_URL = /^\/dashboard\/propiedades\?ref=([^&]+)/;
const CLIENTE_URL = /^\/dashboard\/clientes\?cliente=(\d+)/;
const CLASE_ENLACE = "cursor-pointer font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary";

/** Solo se enlazan estos protocolos (nada de javascript:, data:, etc.). Las citas internas usan cita:. */
const PROTOCOLOS_SEGUROS = /^(https?:|mailto:|tel:|cita:|\/(?!\/)|#)/i;
const urlSegura = (url: string) => (PROTOCOLOS_SEGUROS.test(url.trim()) ? url : "");

/** Dominio al que apunta un enlace externo; así un «pulsa aquí» no puede esconder adónde lleva. */
function anfitrion(href: string): string | null {
  try {
    const u = new URL(href);
    return u.protocol === "http:" || u.protocol === "https:" ? u.hostname.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}

// Tablas al estilo Gemini: sin caja, columnas separadas, una línea bajo cada fila y la primera columna en negrita
const TABLA = "w-full border-separate border-spacing-x-6 text-[15px] [&_td:first-child]:font-semibold [&_td:first-child]:text-foreground";

/** Respuesta en Markdown (listas, tablas) con las citas [F1] convertidas en píldoras que abren el documento. */
export function CitedMarkdown({ text, fuentes = [] }: { text: string; fuentes?: FuenteDocumento[] }) {
  const contenido = React.useMemo(() => enlazarReferencias(enlazarCitas(text, fuentes)), [text, fuentes]);
  const porId = React.useMemo(() => new Map(fuentes.map((f) => [f.id, f])), [fuentes]);
  const abrir = useAbrirFicha();

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
              url={abrir ? undefined : `/dashboard/documentos/${f.documento_id}${f.pagina ? `?pagina=${f.pagina}` : ""}`}
              onSelect={abrir ? () => abrir.documento(f.documento_id, f.pagina) : undefined}
              favicon={<FileKindIcon source={f.titulo} />}
            />
          );
        }
        if (!href) return <>{children}</>;
        const limpio = href.trim();
        const ficha = normalizarEnlaceFicha(limpio);
        const destino = ficha ?? (/^U-\d{3,6}$/.test(limpio) ? `/dashboard/propiedades?ref=${limpio}` : href);
        // Dentro del asistente, las fichas se abren en un panel lateral sin salir de la conversación
        if (abrir) {
          const prop = destino.match(PROP_URL);
          if (prop) return <button type="button" onClick={() => abrir.propiedad(decodeURIComponent(prop[1]))} className={CLASE_ENLACE}>{children}</button>;
          const cli = destino.match(CLIENTE_URL);
          if (cli) return <button type="button" onClick={() => abrir.cliente(Number(cli[1]))} className={CLASE_ENLACE}>{children}</button>;
        }
        // Fuera del asistente (o si algo no coincide), navegación normal; sin abrir pestaña en enlaces internos
        if (destino.startsWith("/")) {
          return <Link href={destino} className={CLASE_ENLACE}>{children}</Link>;
        }
        const host = anfitrion(href);
        return (
          <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-2">
            {children}
            {host && <span className="ml-1 text-xs text-muted-foreground no-underline">({host})</span>}
          </a>
        );
      },
      // Nunca se cargan imágenes de una respuesta: una imagen remota con datos en la URL es una vía clásica de fuga
      img: () => null,
      p: ({ children }) => <p className="leading-relaxed [&:not(:first-child)]:mt-2">{children}</p>,
      ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
      table: ({ children }) => (
        <div className="my-4 -ml-6 overflow-x-auto">
          <table className={TABLA}>{children}</table>
        </div>
      ),
      th: ({ children }) => <th className="border-b border-foreground/15 py-2.5 text-left align-bottom font-normal text-muted-foreground">{children}</th>,
      td: ({ children }) => <td className="border-b border-foreground/15 py-3.5 align-top leading-snug">{children}</td>,
      code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>,
      blockquote: ({ children }) => <blockquote className="my-2 border-l-2 pl-3 text-muted-foreground italic">{children}</blockquote>,
      h1: ({ children }) => <h3 className="mt-5 mb-2 text-lg font-medium tracking-tight">{children}</h3>,
      h2: ({ children }) => <h3 className="mt-5 mb-2 text-lg font-medium tracking-tight">{children}</h3>,
      h3: ({ children }) => <h4 className="mt-4 mb-1.5 text-base font-medium">{children}</h4>,
    }),
    [porId, abrir]
  );

  return (
    <div className="text-[15px] leading-7 break-words text-foreground/90">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlSegura}>
        {contenido}
      </ReactMarkdown>
    </div>
  );
}
