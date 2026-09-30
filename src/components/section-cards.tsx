"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileTextIcon, DatabaseIcon, CpuIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";

interface SectionCardsProps {
  docCount?: number;
  chunkCount?: number;
}

export function SectionCards({ docCount = 1, chunkCount = 1 }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Tarjeta 1: Documentos */}
      <Card className="@container/card border shadow-xs">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <FileTextIcon className="size-4 text-primary" />
            Fuentes Indexadas
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {docCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              Activo
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <CheckCircle2Icon className="size-3.5 text-green-500" />
            Sincronizado con Supabase
          </div>
          <div>Formatos .md, .txt, .pdf</div>
        </CardFooter>
      </Card>

      {/* Tarjeta 2: Fragmentos en pgvector */}
      <Card className="@container/card border shadow-xs">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <DatabaseIcon className="size-4 text-indigo-500" />
            Vectores Almacenados
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {chunkCount}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary" className="text-xs">
              pgvector
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            Índice HNSW (Cosine)
          </div>
          <div>Tabla public.documents</div>
        </CardFooter>
      </Card>

      {/* Tarjeta 3: Modelo Embeddings */}
      <Card className="@container/card border shadow-xs">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <CpuIcon className="size-4 text-amber-500" />
            Modelo Embeddings
          </CardDescription>
          <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl truncate">
            gemini-001
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              768 dims
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            google.genai SDK
          </div>
          <div>Búsqueda semántica densa</div>
        </CardFooter>
      </Card>

      {/* Tarjeta 4: Modelo Generativo */}
      <Card className="@container/card border shadow-xs">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <SparklesIcon className="size-4 text-emerald-500" />
            Modelo de Respuesta
          </CardDescription>
          <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl truncate">
            Gemini Flash
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
              Latest
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            gemini-flash-latest
          </div>
          <div>Citas precisas y sin alucinación</div>
        </CardFooter>
      </Card>
    </div>
  );
}
