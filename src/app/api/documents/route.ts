import { NextResponse } from "next/server";
import { chunkText, embedTexts, getSupabaseClient } from "@/lib/rag";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, source, content")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    interface DocGroup {
      source: string;
      count: number;
      previews: string[];
    }
    const docMap = new Map<string, DocGroup>();

    for (const row of data || []) {
      const existing: DocGroup = docMap.get(row.source) || {
        source: row.source,
        count: 0,
        previews: [],
      };
      existing.count += 1;
      if (existing.previews.length < 3) {
        existing.previews.push(row.content);
      }
      docMap.set(row.source, existing);
    }

    const documents = Array.from(docMap.values());
    const totalChunks = data?.length || 0;

    return NextResponse.json({
      documents,
      totalChunks,
      rawRows: data || [],
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error al obtener documentos";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { source, content } = await req.json();

    if (!source || !content) {
      return NextResponse.json(
        { error: "Nombre de fuente (source) y contenido son obligatorios" },
        { status: 400 }
      );
    }

    const cleanSource = source.trim();
    const chunks = chunkText(content);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "El contenido está vacío" }, { status: 400 });
    }

    const vectors = await embedTexts(chunks, "RETRIEVAL_DOCUMENT");
    const supabase = getSupabaseClient();

    // Eliminar fragmentos anteriores del mismo source si existían
    await supabase.from("documents").delete().eq("source", cleanSource);

    const rows = chunks.map((chunk, idx) => ({
      source: cleanSource,
      content: chunk,
      embedding: vectors[idx],
    }));

    const { error: insertError } = await supabase.from("documents").insert(rows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: cleanSource,
      chunksCreated: chunks.length,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error al indexar documento";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");

    if (!source) {
      return NextResponse.json({ error: "Parámetro 'source' es requerido" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("documents").delete().eq("source", source);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Documento '${source}' eliminado` });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error al eliminar documento";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
