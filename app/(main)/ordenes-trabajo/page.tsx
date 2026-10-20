import PageHeader from "@/components/page-header";
import { obtenerOrdenesTrabajo } from "./actions";
import { OrdenesTable } from "./ordenes-table";

export default async function OrdenesTrabajoPage() {
  const ordenes = await obtenerOrdenesTrabajo();

  return (
    <>
      <PageHeader
        title="Órdenes de Trabajo"
        subtitle="Administra las órdenes de trabajo del taller."
      />
      <OrdenesTable ordenes={ordenes || []} />
    </>
  );
}
