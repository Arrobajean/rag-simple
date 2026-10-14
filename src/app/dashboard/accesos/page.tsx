import { PageHeader } from "@/components/page-header";
import { AccesosPanel } from "@/components/accesos-panel";

export const metadata = { title: "Accesos · Gestión inmobiliaria" };

export default function AccesosPage() {
  return (
    <>
      <PageHeader titulo="Registro de accesos" descripcion="Quién ha entrado a la aplicación, con qué rol, por qué método (LinkedIn o contraseña) y desde qué dispositivo" />
      <AccesosPanel />
    </>
  );
}
