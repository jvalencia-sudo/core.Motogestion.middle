"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TallerPlataforma } from "@/lib/types/superadmin/taller";
import {
  AjustarPrecioDialog,
  ExtenderPruebaDialog,
  PagoManualDialog,
  SuspenderReactivarDialog,
} from "./accion-dialogs";

export default function TallerAcciones({ taller }: { taller: TallerPlataforma }) {
  const [dialogAbierto, setDialogAbierto] = useState<
    "extender" | "pago" | "suspender" | "reactivar" | "precio" | null
  >(null);

  return (
    <div className="flex flex-wrap gap-2">
      {taller.estadoTal === "prueba" && (
        <Button size="sm" variant="outline" onClick={() => setDialogAbierto("extender")}>
          Extender prueba
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => setDialogAbierto("pago")}>
        Registrar pago manual
      </Button>
      {taller.estadoTal === "suspendido" ? (
        <Button size="sm" variant="outline" onClick={() => setDialogAbierto("reactivar")}>
          Reactivar
        </Button>
      ) : (
        <Button size="sm" variant="destructive" onClick={() => setDialogAbierto("suspender")}>
          Suspender
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => setDialogAbierto("precio")}>
        Ajustar precio
      </Button>

      <ExtenderPruebaDialog
        codTaller={taller.codTaller}
        open={dialogAbierto === "extender"}
        onOpenChange={(open) => setDialogAbierto(open ? "extender" : null)}
      />
      <PagoManualDialog
        codTaller={taller.codTaller}
        open={dialogAbierto === "pago"}
        onOpenChange={(open) => setDialogAbierto(open ? "pago" : null)}
      />
      <SuspenderReactivarDialog
        codTaller={taller.codTaller}
        accion="suspender"
        open={dialogAbierto === "suspender"}
        onOpenChange={(open) => setDialogAbierto(open ? "suspender" : null)}
      />
      <SuspenderReactivarDialog
        codTaller={taller.codTaller}
        accion="reactivar"
        open={dialogAbierto === "reactivar"}
        onOpenChange={(open) => setDialogAbierto(open ? "reactivar" : null)}
      />
      <AjustarPrecioDialog
        codTaller={taller.codTaller}
        precioActual={taller.precioSuscTal}
        open={dialogAbierto === "precio"}
        onOpenChange={(open) => setDialogAbierto(open ? "precio" : null)}
      />
    </div>
  );
}
