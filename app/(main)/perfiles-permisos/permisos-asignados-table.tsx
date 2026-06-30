"use client";

import { useState } from "react";
import { PerfilPermiso } from "@/lib/types/auth/perfil-permiso";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface PermisosAsignadosTableProps {
  permisos: PerfilPermiso[];
  loading: boolean;
  onCambiarEstado: (permiso: PerfilPermiso, nuevoEstado: number) => Promise<void>;
}

export function PermisosAsignadosTable({
  permisos,
  loading,
  onCambiarEstado,
}: PermisosAsignadosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [updatingPermiso, setUpdatingPermiso] = useState<number | null>(null);

  const filteredPermisos = permisos.filter((permiso) => {
    const matchesSearch =
      permiso.nombrePrm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.descripcionPrm?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado =
      estadoFilter === "todos" ||
      (estadoFilter === "activo" && permiso.estadoPermiso === "Activo") ||
      (estadoFilter === "inactivo" && permiso.estadoPermiso !== "Activo");

    return matchesSearch && matchesEstado;
  });

  const handleToggle = async (permiso: PerfilPermiso, checked: boolean) => {
    setUpdatingPermiso(permiso.codPrm);
    const nuevoEstado = checked ? 1 : 2; // 1 = Activo, 2 = Inactivo
    await onCambiarEstado(permiso, nuevoEstado);
    setUpdatingPermiso(null);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="inactivo">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPermisos.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          {searchTerm || estadoFilter !== "todos"
            ? "No se encontraron permisos con los filtros aplicados"
            : "No hay permisos asignados a este perfil"}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permiso</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Vista/Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{permiso.nombreVis}</span>
                      <span className="text-xs text-muted-foreground">{permiso.rutaVis}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={permiso.estadoPermiso === "Activo" ? "default" : "secondary"}>
                      {permiso.estadoPermiso}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        {permiso.estadoPermiso === "Activo" ? "Activo" : "Inactivo"}
                      </span>
                      <Switch
                        checked={permiso.estadoPermiso === "Activo"}
                        onCheckedChange={(checked) => handleToggle(permiso, checked)}
                        disabled={updatingPermiso === permiso.codPrm}
                      />
                    </div>
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
