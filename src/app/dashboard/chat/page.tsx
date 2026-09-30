import { PageHeader } from "@/components/page-header";
import { RagChat } from "@/components/rag-chat";

export const metadata = { title: "Asistente · Gestión inmobiliaria" };

export default function ChatPage() {
  return (
    <>
      <PageHeader titulo="Asistente" descripcion="Pregunta en lenguaje natural: cuenta con SQL y lee los documentos con búsqueda semántica" />
      <RagChat />
    </>
  );
}
