"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PerfilDetallado } from "@/lib/types/auth/perfil";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { cambiarEstadoPerfil, eliminarPerfil } from "./actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const perfilesColumns: ColumnDef<PerfilDetallado>[] = [
  {
    accessorKey: "codPrf",
    header: "Código",
  },
  {
    accessorKey: "nombrePrf",
    header: "Nombre",
  },
  {
    accessorKey: "descripcionPrf",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.original.descripcionPrf || "";
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
    accessorKey: "nombreRolPrf",
    header: "Rol",
  },
  {
    accessorKey: "nombreEstPrf",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.nombreEstPrf;
      const isActivo = estado.toLowerCase() === "activo";

      return (
        <Badge variant={isActivo ? "default" : "secondary"}>
          {estado}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const perfil = row.original;
      const router = useRouter();
      const isActivo = perfil.nombreEstPrf.toLowerCase() === "activo";

      const [dialogState, setDialogState] = useState<{
        open: boolean;
        type: "estado" | "eliminar" | "error";
        mensaje?: string;
      }>({ open: false, type: "estado" });

      const handleCambiarEstado = async () => {
        const nuevoEstado = isActivo ? 2 : 1;
        const accion = isActivo ? "desactivar" : "activar";

        const resp = await cambiarEstadoPerfil({
          codPrf: perfil.codPrf,
          codEstPrf: nuevoEstado,
        });

        if (!resp.error) {
          router.refresh();
        } else {
          setDialogState({
            open: true,
            type: "error",
            mensaje: `Error al ${accion} el perfil: ${resp.error}`,
          });
        }
      };

      const handleEliminar = async () => {
        const resp = await eliminarPerfil(perfil.codPrf);

        if (!resp.error) {
          router.refresh();
        } else {
          setDialogState({
            open: true,
            type: "error",
            mensaje: `Error al eliminar el perfil: ${resp.error}`,
          });
        }
      };

      return (
        <>
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
                  href={`/perfiles-permisos/editar?cod=${perfil.codPrf}`}
                  className="flex items-center cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center cursor-pointer"
                onClick={() =>
                  setDialogState({ open: true, type: "estado" })
                }
              >
                {isActivo ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center text-destructive cursor-pointer"
                onClick={() =>
                  setDialogState({ open: true, type: "eliminar" })
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog para cambiar estado */}
          <AlertDialog
            open={dialogState.open && dialogState.type === "estado"}
            onOpenChange={(open) =>
              setDialogState({ ...dialogState, open })
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isActivo ? "Desactivar" : "Activar"} perfil
                </AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de {isActivo ? "desactivar" : "activar"} el
                  perfil "{perfil.nombrePrf}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setDialogState({ open: false, type: "estado" });
                    handleCambiarEstado();
                  }}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog para eliminar */}
          <AlertDialog
            open={dialogState.open && dialogState.type === "eliminar"}
            onOpenChange={(open) =>
              setDialogState({ ...dialogState, open })
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar perfil</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de eliminar el perfil "{perfil.nombrePrf}"?
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setDialogState({ open: false, type: "eliminar" });
                    handleEliminar();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog para errores */}
          <AlertDialog
            open={dialogState.open && dialogState.type === "error"}
            onOpenChange={(open) =>
              setDialogState({ ...dialogState, open })
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Error</AlertDialogTitle>
                <AlertDialogDescription>
                  {dialogState.mensaje}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() =>
                    setDialogState({ open: false, type: "error" })
                  }
                >
                  Aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
