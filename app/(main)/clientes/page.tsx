import { CirclePlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/fetch";
import Link from "next/link";
import { columns } from "./columns";
import { Cliente } from "@/lib/types/cliente";

async function loadClienteData() {
  return await appFetch<Cliente[]>("/api/clientes");
}

export default async function ClientesPage() {
  const clienteData = await loadClienteData();

  console.log("👥 Clientes cargados:", clienteData);

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Aquí es donde encuentras todos los clientes registrados."
      />
      <DataTable
        columns={columns}
        data={clienteData.data || []}
        extraActions={
          <>
            <Link href="/clientes/crear">
              <Button className="h-8">
                <CirclePlusIcon className="mr-2 h-4 w-4" />
                Crear
              </Button>
            </Link>
          </>
        }
      />
    </>
  );
}
