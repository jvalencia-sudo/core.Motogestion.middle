import { CirclePlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/fetch";
import Link from "next/link";
import { columns } from "./columns";
import { VwOperationModel } from "@/lib/types/operation/operation";
import {Rol} from "@/lib/types/auth/rol";

async function loadOperationData() {
  return await appFetch<Rol[]>("/api/rol");
}

export default async function Component() {
  const rolData = await loadOperationData();
  return (
    <>
      <PageHeader
        title="Roles"
        subtitle="Aqui es donde encuentras todos los roles."
      />
      <DataTable
        columns={columns}
        data={rolData.data || []}
        extraActions={
          <>
            <Link href="/roles/crear">
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
