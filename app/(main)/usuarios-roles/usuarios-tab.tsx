import { CirclePlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { obtenerUsuarios } from "./actions";

export default async function UsuariosTab() {
  const usersData = await obtenerUsuarios();

  return (
    <DataTable
      columns={columns}
      data={usersData.data || []}
      extraActions={
        <Link href="/usuarios-roles/crear">
          <Button className="h-8">
            <CirclePlusIcon className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </Link>
      }
    />
  );
}
