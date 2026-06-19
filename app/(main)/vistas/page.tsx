import { CirclePlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/fetch";
import Link from "next/link";
import { columns } from "./columns";
import { VwOperationModel } from "@/lib/types/operation/operation";
import {Vista} from "@/lib/types/auth/vista";

async function loadVistaData() {
  return await appFetch<Vista[]>("/api/vista");
}

export default async function Component() {
  const operationData = await loadVistaData();
  console.log(operationData);
  return (
    <>
      <PageHeader
        title="Vistas"
        subtitle="Aqui es donde encuentras todos las vistas."
      />
      <DataTable
        columns={columns}
        data={operationData.data || []}
        extraActions={
          <>
            <Link href="/vistas/crear">
              <Button className="h-8">
                <CirclePlusIcon className="mr-2 h-4 w-4" />
                Create
              </Button>
            </Link>
          </>
        }
      />
    </>
  );
}
