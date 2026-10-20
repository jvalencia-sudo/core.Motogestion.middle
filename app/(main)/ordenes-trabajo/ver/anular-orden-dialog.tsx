"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ban } from "lucide-react";
import { anularOrdenTrabajo } from "../actions";

interface AnularOrdenDialogProps {
  consecutivo: number;
}

const MOTIVO_MIN = 5;

export function AnularOrdenDialog({ consecutivo }: AnularOrdenDialogProps) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const resp = await anularOrdenTrabajo(consecutivo, motivo);
    if (resp.error) {
      setGuardando(false);
      setError(resp.error);
      return;
    }
    // F1-05: router.refresh() no alcanza -- el historial de cambios es un
    // componente cliente con su propio fetch (useEffect sobre `consecutivo`,
    // que no cambia), así que queda con los datos viejos si no se recarga
    // la página completa (mismo patrón que motos/clientes tras eliminar).
    window.location.reload();
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Ban className="mr-2 h-4 w-4" />
        Anular Orden
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular orden de trabajo #{consecutivo}</DialogTitle>
            <DialogDescription>
              Devuelve al inventario los productos de la orden y queda registrado
              quién y por qué. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="motivo-anular">Motivo</Label>
              <Textarea
                id="motivo-anular"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Por qué se anula esta orden"
              />
              {motivo.trim().length > 0 && motivo.trim().length < MOTIVO_MIN && (
                <p className="text-xs text-destructive mt-1">
                  El motivo debe tener al menos {MOTIVO_MIN} caracteres
                </p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmar}
              disabled={guardando || motivo.trim().length < MOTIVO_MIN}
            >
              {guardando ? "Anulando..." : "Confirmar anulación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
