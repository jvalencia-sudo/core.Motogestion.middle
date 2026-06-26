"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Eye, Trash2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ReclamoResumen } from "@/lib/types/reclamo";
import { useTransition, useState } from "react";
import { eliminarReclamo } from "./actions";
import { usePermissions } from "@/hooks/use-permissions";
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

interface ActionsCellProps {
  reclamo: ReclamoResumen;
}

export function ActionsCell({ reclamo }: ActionsCellProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { hasPermission } = usePermissions();

  const canUpdate = hasPermission("actualizar:reclamos");
  const canDelete = hasPermission("eliminar:reclamos");
  const canCreateOrder = hasPermission("crear:ordenes-trabajo");

  if (!canUpdate && !canDelete) {
    return null;
  }

  const handleDelete = () => {
    startTransition(async () => {
      await eliminarReclamo(reclamo.codRec);
      setShowDeleteDialog(false);
      // Recargar la página después de eliminar
      window.location.reload();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canUpdate && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href={`/reclamos/ver?codRec=${reclamo.codRec}`}
                  className="flex items-center cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/reclamos/editar?codRec=${reclamo.codRec}`}
                  className="flex items-center cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
            </>
          )}
          {canCreateOrder && reclamo.estadoGarantia === "VIGENTE" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/ordenes-trabajo/crear?placaMot=${encodeURIComponent(reclamo.placaMot || "")}`}
                  className="flex items-center cursor-pointer text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nueva Orden
                </Link>
              </DropdownMenuItem>
            </>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 cursor-pointer"
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reclamo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el reclamo #{reclamo.codRec}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
