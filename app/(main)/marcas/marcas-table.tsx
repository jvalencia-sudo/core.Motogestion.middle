"use client";

import { CirclePlusIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { Marca } from "@/lib/types/marca";

interface MarcasTableProps {
  data: Marca[];
}

export function MarcasTable({ data }: MarcasTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
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
  );
}
