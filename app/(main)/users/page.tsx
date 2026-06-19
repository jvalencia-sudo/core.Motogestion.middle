import { CirclePlusIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";

import {appFetch} from "@/lib/fetch";

import {VwUsuarioPerfil} from "@/lib/types/auth/user";

async function loadUsersData() {
    return await appFetch<VwUsuarioPerfil[]>("/api/admin/users/all");
}
export default async function UsersPage() {
  const usersData = await loadUsersData();
 console.log(usersData);
  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Administra todos los usuarios del sistema."
      />
      <DataTable
        columns={columns}
        data={usersData.data || []}
        extraActions={
          <>
            <Link href="/users/crear">
              <Button className="h-8">
                <CirclePlusIcon className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            </Link>
          </>
        }
      />
    </>
  );
}
