import { CirclePlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/fetch";
import Link from "next/link";
import { columns } from "./columns";
import { Marca } from "@/lib/types/marca";

async function loadMarcaData() {
  return await appFetch<Marca[]>("/api/marcas/resumen");
}

export default async function MarcasPage() {
  const marcaData = await loadMarcaData();

  console.log("🏍️ Marcas cargadas:", marcaData);

  return (
    <>
      <PageHeader
        title="Marcas"
        subtitle="Aquí es donde encuentras todas las marcas registradas."
      />
      <DataTable
        columns={columns}
        data={marcaData.data || []}
        extraActions={
          <>
            <Link href="/marcas/crear">
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
