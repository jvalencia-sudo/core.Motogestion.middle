"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, XCircle, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { desactivarProducto, activarProducto } from "./actions";
import { useRouter } from "next/navigation";
import { Producto } from "@/lib/types/producto";

interface ActionsCellProps {
  producto: Producto;
}

export function ActionsCell({ producto }: ActionsCellProps) {
  const router = useRouter();

  const handleToggleEstado = async () => {
    const esActivo = producto.estadoProducto === "Activo";
    const accion = esActivo ? "desactivar" : "activar";
    const confirmMessage = `¿Estás seguro de ${accion} el producto "${producto.nombrePro}"?`;

    if (confirm(confirmMessage)) {
      try {
        const resp = esActivo
          ? await desactivarProducto(producto.codPro)
          : await activarProducto(producto.codPro);

        if (resp.error) {
          alert(`Error: ${resp.error}`);
        } else {
          router.refresh();
        }
      } catch (error) {
        alert("Error al cambiar el estado del producto");
      }
    }
  };

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
            href={`/productos/editar?cod=${producto.codPro}`}
            className="flex items-center cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={`flex items-center cursor-pointer ${
            producto.estadoProducto === "Activo" ? "text-destructive" : "text-green-600"
          }`}
          onClick={handleToggleEstado}
        >
          {producto.estadoProducto === "Activo" ? (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              Desactivar
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activar
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
