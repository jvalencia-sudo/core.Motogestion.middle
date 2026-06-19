"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Rol } from "@/lib/types/auth/rol";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

export const columns: ColumnDef<Rol>[] = [
  {
    accessorKey: "codRol",
    header: "Codigo",
  },
  {
    accessorKey: "nombreRol",
    header: "Nombre",
  },
  {
    accessorKey: "descripcionRol",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.original.descripcionRol || "";
      const maxLength = 50;

      return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[200px] block cursor-pointer text-left">
                {descripcion.length > maxLength
                    ? `${descripcion.slice(0, maxLength)}...`
                    : descripcion}
              </TooltipTrigger>
              {descripcion.length > maxLength && (
                  <TooltipContent className="max-w-[300px]">
                    {descripcion}
                  </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const rol = row.original;

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
                <Link href={`/roles/editar?cod=${rol.codRol}`} className="flex items-center cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                  className="flex items-center text-destructive cursor-pointer"
                  onClick={() => {
                    if (confirm(`¿Estás seguro de eliminar el rol "${rol.nombreRol}"?`)) {
                      // Llamar a la action de eliminar
                      // eliminarRol(rol.id);
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