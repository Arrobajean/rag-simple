import { PanelResumen } from "@/components/panel-resumen";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Panel · Gestión inmobiliaria" };

export default function PanelPage() {
  return (
    <>
      <PageHeader titulo="Panel" descripcion="Estado de la cartera de un vistazo" />
      <PanelResumen />
    </>
  );
}
