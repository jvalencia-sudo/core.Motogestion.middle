"use client";

import { ColumnDef } from "@tanstack/react-table";

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
import {Vista} from "@/lib/types/auth/vista";

export const columns: ColumnDef<Vista>[] = [
  {
    accessorKey: "nombreVis",
    header: "Nombre",
  },
  {
    accessorKey: "rutaVis",
    header: "Ruta",
    cell: ({ row }) => {
      const ruta = row.original.rutaVis || "";
      const maxLength = 50;

      return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[200px] block cursor-pointer text-left">
                {ruta.length > maxLength
                    ? `${ruta.slice(0, maxLength)}...`
                    : ruta}
              </TooltipTrigger>
              {ruta.length > maxLength && (
                  <TooltipContent className="max-w-[300px]">
                    {ruta}
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
      const vista = row.original;

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
                <Link
                    href={`/vistas/editar?ruta=${encodeURIComponent(vista.rutaVis)}`}
                    className="flex items-center cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                  className="flex items-center text-destructive cursor-pointer"
                  onClick={() => {
                    if (confirm(`¿Estás seguro de eliminar la vista "${vista.rutaVis}"?`)) {
                      // Llamar a la action de eliminar
                      // eliminarVista(vista.rutaVista);
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