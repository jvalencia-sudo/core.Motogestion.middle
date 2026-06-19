import { CirclePlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/fetch";
import Link from "next/link";
import { columns } from "./columns";
import { Moto } from "@/lib/types/moto";

async function loadMotoData() {
  return await appFetch<Moto[]>("/api/motos");
}

export default async function MotosPage() {
  const motoData = await loadMotoData();

  console.log("🛵 Motos cargadas:", motoData);

  return (
    <>
      <PageHeader
        title="Motos"
        subtitle="Aquí es donde encuentras todas las motos registradas."
      />
      <DataTable
        columns={columns}
        data={motoData.data || []}
        extraActions={
          <>
            <Link href="/motos/crear">
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
