"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { OrdenTrabajoResumen } from "@/lib/types/ordenTrabajo";

interface ActionsCellProps {
  orden: OrdenTrabajoResumen;
}

export function ActionsCell({ orden }: ActionsCellProps) {
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
            href={`/ordenes-trabajo/ver?consecutivo=${orden.consecutivoOt}`}
            className="flex items-center cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/ordenes-trabajo/editar?consecutivo=${orden.consecutivoOt}`}
            className="flex items-center cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
