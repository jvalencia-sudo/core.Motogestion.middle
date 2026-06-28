"use client";

import { useState } from "react";
import { PermisoDisponible } from "@/lib/types/auth/perfil-permiso";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus } from "lucide-react";

interface PermisosDisponiblesTableProps {
  permisos: PermisoDisponible[];
  loading: boolean;
  onAsignar: (permiso: PermisoDisponible) => Promise<void>;
}

export function PermisosDisponiblesTable({
  permisos,
  loading,
  onAsignar,
}: PermisosDisponiblesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [asignandoPermiso, setAsignandoPermiso] = useState<number | null>(null);

  const filteredPermisos = permisos.filter((permiso) => {
    const matchesSearch =
      permiso.nombrePrm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.descripcionPrm?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleAsignar = async (permiso: PermisoDisponible) => {
    setAsignandoPermiso(permiso.codPrm);
    await onAsignar(permiso);
    setAsignandoPermiso(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredPermisos.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          {searchTerm
            ? "No se encontraron permisos con el término de búsqueda"
            : "No hay permisos disponibles para asignar"}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permiso</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermisos.map((permiso) => (
                <TableRow key={permiso.codPrm}>
                  <TableCell className="font-medium">{permiso.nombrePrm}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {permiso.descripcionPrm || "Sin descripción"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {permiso.rutaVisPrm}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleAsignar(permiso)}
                      disabled={asignandoPermiso === permiso.codPrm}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {asignandoPermiso === permiso.codPrm ? "Asignando..." : "Asignar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
