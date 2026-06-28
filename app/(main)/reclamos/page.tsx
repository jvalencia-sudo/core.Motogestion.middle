import PageHeader from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { obtenerReclamos } from "./actions";
import { CreateButton } from "./create-button";

export default async function ReclamosPage() {
  const reclamos = await obtenerReclamos();

  return (
    <>
      <PageHeader
        title="Reclamos"
        subtitle="Gestiona los reclamos de órdenes de trabajo completadas"
      />
      <DataTable
        columns={columns}
        data={reclamos || []}
        extraActions={<CreateButton />}
      />
    </>
  );
}
