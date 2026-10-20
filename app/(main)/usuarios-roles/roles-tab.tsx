"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import { PerfilDetallado } from "@/lib/types/auth/perfil";
import { Permiso } from "@/lib/types/auth/permiso";
import MatrizPermisosDialog from "./matriz-permisos-dialog";
import PerfilFormDialog from "./perfil-form-dialog";
import { eliminarPerfil } from "./actions";

export default function RolesTab({
  perfiles,
  catalogo,
}: {
  perfiles: PerfilDetallado[];
  catalogo: Permiso[];
}) {
  const [perfilEditando, setPerfilEditando] = useState<PerfilDetallado | null>(null);
  const [formDialog, setFormDialog] = useState<{ perfil?: PerfilDetallado } | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const router = useRouter();

  const perfilesNoAdmin = perfiles.filter((p) => !p.esAdmin);

  async function handleEliminar(perfil: PerfilDetallado) {
    if (!confirm(`¿Eliminar el rol "${perfil.nombrePrf}"?`)) return;
    setEliminando(perfil.codPrf);
    const resp = await eliminarPerfil(perfil.codPrf);
    setEliminando(null);
    if (resp.error) {
      alert(resp.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setFormDialog({})}>
          <Plus className="mr-1 h-4 w-4" />
          Crear rol
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perfiles.map((perfil) => {
          const esAdmin = perfil.esAdmin;
          return (
            <Card key={perfil.codPrf}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{perfil.nombrePrf}</p>
                    <p className="text-sm text-muted-foreground">{perfil.descripcionPrf}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {esAdmin && <Badge>Acceso total</Badge>}
                    {!esAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPerfilEditando(perfil)}>
                            Editar permisos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFormDialog({ perfil })}>
                            Renombrar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={eliminando === perfil.codPrf}
                            onClick={() => handleEliminar(perfil)}
                          >
                            {eliminando === perfil.codPrf ? "Eliminando..." : "Eliminar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {perfil.numUsuarios} {perfil.numUsuarios === 1 ? "usuario" : "usuarios"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {perfilEditando && (
        <MatrizPermisosDialog
          perfil={perfilEditando}
          catalogo={catalogo}
          open={!!perfilEditando}
          onOpenChange={(open) => {
            if (!open) setPerfilEditando(null);
          }}
        />
      )}

      {formDialog && (
        <PerfilFormDialog
          perfil={formDialog.perfil}
          perfilesExistentes={perfilesNoAdmin}
          open={!!formDialog}
          onOpenChange={(open) => {
            if (!open) setFormDialog(null);
          }}
        />
      )}
    </>
  );
}
