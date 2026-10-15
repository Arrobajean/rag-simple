import { ClientesPanel } from "@/components/clientes-panel";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Clientes · Gestión inmobiliaria" };

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const { cliente } = await searchParams;
  const id = cliente && /^\d+$/.test(cliente) ? Number(cliente) : null;
  return (
    <>
      <PageHeader titulo="Clientes" descripcion="Cruce entre lo que busca cada cliente y las propiedades disponibles (filtros exactos + afinidad semántica)" />
      <ClientesPanel clienteInicial={id} />
    </>
  );
}
