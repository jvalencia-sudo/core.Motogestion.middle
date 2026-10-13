"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Marca } from "@/lib/types/marca";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const columns: ColumnDef<Marca>[] = [
  {
    accessorKey: "codMar",
    header: "Código",
  },
  {
    accessorKey: "nombreMar",
    header: "Nombre",
  },
  {
    accessorKey: "totalMotos",
    header: "Motos",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const marca = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/marcas/editar?cod=${marca.codMar}`} className="flex items-center cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center text-destructive cursor-pointer"
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar "${marca.nombreMar}"?`)) {
                  // TODO: Implementar eliminación
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
