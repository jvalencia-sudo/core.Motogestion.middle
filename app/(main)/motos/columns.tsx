"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Moto } from "@/lib/types/moto";
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
import { eliminarMoto } from "./actions";

// F1-10: en celular solo quedan visibles Placa, Propietario y Acciones; el
// resto se ve desde md: hacia arriba.
export const columns: ColumnDef<Moto>[] = [
  {
    accessorKey: "placaMot",
    header: "Placa",
  },
  {
    accessorKey: "marca",
    header: "Marca",
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "modeloMot",
    header: "Modelo",
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "colorMot",
    header: "Color",
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "cilindrajeMot",
    header: "Cilindraje",
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "propietario",
    header: "Propietario",
  },
  {
    accessorKey: "telefonoCli",
    header: "Teléfono",
    meta: { className: "hidden md:table-cell" },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const moto = row.original;

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
              <Link href={`/motos/editar?placa=${moto.placaMot}`} className="flex items-center cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center text-destructive cursor-pointer"
              onClick={async () => {
                if (confirm(`¿Estás seguro de eliminar la moto "${moto.placaMot}" (${moto.marca})?`)) {
                  try {
                    const resp = await eliminarMoto(moto.placaMot);
                    if (!resp.error) {
                      // Éxito: recargar página
                      alert("Moto eliminada exitosamente");
                      window.location.reload();
                    } else {
                      // Error: mostrar mensaje descriptivo
                      alert(`Error: ${resp.error}`);
                    }
                  } catch {
                    alert("Error al conectar con el servidor");
                  }
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
