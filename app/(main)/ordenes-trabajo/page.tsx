import { CirclePlusIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { obtenerOrdenesTrabajo } from "./actions";

export default async function OrdenesTrabajoPage() {
  const ordenes = await obtenerOrdenesTrabajo();

  return (
    <>
      <PageHeader
        title="Órdenes de Trabajo"
        subtitle="Administra las órdenes de trabajo del taller."
      />
      <DataTable
        columns={columns}
        data={ordenes || []}
        extraActions={
          <>
            <Link href="/ordenes-trabajo/crear">
              <Button className="h-8">
                <CirclePlusIcon className="mr-2 h-4 w-4" />
                Nueva Orden
              </Button>
            </Link>
          </>
        }
      />
    </>
  );
}
