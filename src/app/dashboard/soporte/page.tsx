import { PageHeader } from "@/components/page-header";
import { SoportePanel } from "@/components/soporte-panel";

export const metadata = { title: "Soporte y feedback · Gestión inmobiliaria" };

export default function SoportePage() {
  return (
    <>
      <PageHeader titulo="Soporte y feedback" descripcion="Mensajes que dejan los usuarios desde el menú lateral: incidencias y dudas, junto a las sugerencias de mejora" />
      <SoportePanel />
    </>
  );
}
