"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PerfilDetallado } from "@/lib/types/auth/perfil";
import { Permiso } from "@/lib/types/auth/permiso";
import MatrizPermisosDialog from "./matriz-permisos-dialog";

const ADMIN_ROL = 1;

export default function RolesTab({
  perfiles,
  catalogo,
}: {
  perfiles: PerfilDetallado[];
  catalogo: Permiso[];
}) {
  const [perfilEditando, setPerfilEditando] = useState<PerfilDetallado | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perfiles.map((perfil) => {
          const esAdmin = perfil.codRolPrf === ADMIN_ROL;
          return (
            <Card key={perfil.codPrf}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{perfil.nombrePrf}</p>
                    <p className="text-sm text-muted-foreground">{perfil.descripcionPrf}</p>
                  </div>
                  {esAdmin && <Badge>Acceso total</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {perfil.numUsuarios} {perfil.numUsuarios === 1 ? "usuario" : "usuarios"}
                </p>
                {!esAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="self-start"
                    onClick={() => setPerfilEditando(perfil)}
                  >
                    Editar permisos
                  </Button>
                )}
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
    </>
  );
}
