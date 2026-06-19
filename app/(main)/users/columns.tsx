"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VwUsuarioPerfil } from "@/lib/types/auth/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, UserX, UserCheck, KeyRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { desactivarUsuario, activarUsuario } from "./actions";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<VwUsuarioPerfil>[] = [
  {
    accessorKey: "documentoUsu",
    header: "Documento",
  },
  {
    accessorKey: "nombreCompleto",
    header: "Nombre Completo",
  },
  {
    accessorKey: "correoUsu",
    header: "Correo",
  },
  {
    accessorKey: "estadoUsuario",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estadoUsuario;
      return (
        <Badge variant={estado === "Activo" ? "default" : "destructive"}>
          {estado}
        </Badge>
      );
    },
  },
  {
    accessorKey: "perfil",
    header: "Perfil",
  },
  {
    accessorKey: "rol",
    header: "Rol",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const user = row.original;
      const router = useRouter();

      const handleToggleEstado = async () => {
        const esActivo = user.estadoUsuario === "Activo";
        const accion = esActivo ? "desactivar" : "activar";
        const confirmMessage = `¿Estás seguro de ${accion} al usuario "${user.nombreCompleto}"?`;

        if (confirm(confirmMessage)) {
          try {
            const resp = esActivo
              ? await desactivarUsuario(user.documentoUsu)
              : await activarUsuario(user.documentoUsu);

            if (resp.error) {
              alert(`Error: ${resp.error}`);
            } else {
              router.refresh();
            }
          } catch (error) {
            alert("Error al cambiar el estado del usuario");
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
                href={`/users/editar?doc=${user.documentoUsu}`}
                className="flex items-center cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/users/resetear-contrasena?doc=${user.documentoUsu}`}
                className="flex items-center cursor-pointer"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Resetear Contraseña
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={`flex items-center cursor-pointer ${
                user.estadoUsuario === "Activo" ? "text-destructive" : "text-green-600"
              }`}
              onClick={handleToggleEstado}
            >
              {user.estadoUsuario === "Activo" ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
