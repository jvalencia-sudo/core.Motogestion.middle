"use client";

import { useState, useEffect } from "react";
import {
  PerfilConRol,
  PerfilPermiso,
  PermisoDisponible,
  AsignarPermisoRequest,
  CambiarEstadoPermisoRequest,
} from "@/lib/types/auth/perfil-permiso";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermisosAsignadosTable } from "./permisos-asignados-table";
import { PermisosDisponiblesTable } from "./permisos-disponibles-table";
import { useToast } from "@/hooks/use-toast";

interface PerfilesPermisosManagerProps {
  perfiles: PerfilConRol[];
}

export function PerfilesPermisosManager({ perfiles }: PerfilesPermisosManagerProps) {
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilConRol | null>(null);
  const [permisosAsignados, setPermisosAsignados] = useState<PerfilPermiso[]>([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState<PermisoDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPerfil) {
      loadPermisosData();
    }
  }, [selectedPerfil]);

  const loadPermisosData = async () => {
    if (!selectedPerfil) return;

    setLoading(true);
    try {
      // Cargar permisos asignados
      const asignadosRes = await fetch(
        `/api/perfil-permiso/perfil/${selectedPerfil.codPrf}?cod_rol=${selectedPerfil.codRolPrf}`
      );
      if (asignadosRes.ok) {
        const asignadosData = await asignadosRes.json();
        setPermisosAsignados(asignadosData);
      }

      // Cargar permisos disponibles
      const disponiblesRes = await fetch(
        `/api/perfil-permiso/perfil/${selectedPerfil.codPrf}/disponibles?cod_rol=${selectedPerfil.codRolPrf}`
      );
      if (disponiblesRes.ok) {
        const disponiblesData = await disponiblesRes.json();
        setPermisosDisponibles(disponiblesData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los permisos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarPermiso = async (permiso: PermisoDisponible) => {
    if (!selectedPerfil) return;

    const request: AsignarPermisoRequest = {
      codPrf: selectedPerfil.codPrf,
      codRol: selectedPerfil.codRolPrf,
      codPrm: permiso.codPrm,
      codEst: 1, // Activo por defecto
    };

    try {
      const res = await fetch("/api/perfil-permiso/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Éxito",
          description: data.message || "Permiso asignado correctamente",
        });
        await loadPermisosData();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.detail || "Error al asignar el permiso",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al asignar el permiso",
        variant: "destructive",
      });
    }
  };

  const handleCambiarEstado = async (permiso: PerfilPermiso, nuevoEstado: number) => {
    if (!selectedPerfil) return;

    const request: CambiarEstadoPermisoRequest = {
      codPrf: selectedPerfil.codPrf,
      codRol: selectedPerfil.codRolPrf,
      codPrm: permiso.codPrm,
      codEst: nuevoEstado,
    };

    try {
      const res = await fetch("/api/perfil-permiso/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Éxito",
          description: data.message || "Estado actualizado correctamente",
        });
        await loadPermisosData();
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.detail || "Error al cambiar el estado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cambiar el estado del permiso",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Perfil</CardTitle>
          <CardDescription>
            Elige un perfil para gestionar sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedPerfil?.codPrf.toString()}
            onValueChange={(value) => {
              const perfil = perfiles.find((p) => p.codPrf === parseInt(value));
              setSelectedPerfil(perfil || null);
            }}
          >
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Selecciona un perfil" />
            </SelectTrigger>
            <SelectContent>
              {perfiles.map((perfil) => (
                <SelectItem key={perfil.codPrf} value={perfil.codPrf.toString()}>
                  {perfil.nombrePrf} {perfil.nombreRol ? `(${perfil.nombreRol})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPerfil && (
        <Tabs defaultValue="asignados" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="asignados">Permisos Asignados</TabsTrigger>
            <TabsTrigger value="disponibles">Permisos Disponibles</TabsTrigger>
          </TabsList>

          <TabsContent value="asignados" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Permisos Asignados</CardTitle>
                <CardDescription>
                  Gestiona los permisos que tiene asignados el perfil {selectedPerfil.nombrePrf}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermisosAsignadosTable
                  permisos={permisosAsignados}
                  loading={loading}
                  onCambiarEstado={handleCambiarEstado}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disponibles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Permisos Disponibles</CardTitle>
                <CardDescription>
                  Permisos que pueden ser asignados al perfil {selectedPerfil.nombrePrf}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermisosDisponiblesTable
                  permisos={permisosDisponibles}
                  loading={loading}
                  onAsignar={handleAsignarPermiso}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedPerfil && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Selecciona un perfil para comenzar a gestionar sus permisos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}