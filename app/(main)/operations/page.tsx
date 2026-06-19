import { CirclePlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { appFetch } from "@/lib/fetch";
import Link from "next/link";
import { columns } from "./columns";
import { VwOperationModel } from "@/lib/types/operation/operation";

async function loadOperationData() {
  return await appFetch<VwOperationModel[]>("/api/operation");
}

export default async function Component() {
  const operationData = await loadOperationData();
  return (
    <>
      <PageHeader
        title="Operation"
        subtitle="Here you can find the operations."
      />
      <DataTable
        columns={columns}
        data={operationData.data || []}
        extraActions={
          <>
            <Link href="/operations/edit">
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
