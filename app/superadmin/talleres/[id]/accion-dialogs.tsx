"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AjustarPrecioRequest,
  ExtenderPruebaRequest,
  PagoManualRequest,
  SuspenderReactivarRequest,
} from "@/lib/types/superadmin/accion";
import {
  ajustarPrecio,
  extenderPrueba,
  reactivarTaller,
  registrarPagoManual,
  suspenderTaller,
} from "../../actions";

type DialogBaseProps = {
  codTaller: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Las 4 acciones comparten la misma mecánica (motivo obligatorio, un solo
// POST/PUT, refrescar al terminar) -- cada una solo difiere en los campos
// extra y la llamada al server action. Mismo patrón que
// usuarios-roles/matriz-permisos-dialog.tsx (F0-13): error inline, sin toast.

export function ExtenderPruebaDialog({ codTaller, open, onOpenChange }: DialogBaseProps) {
  const [dias, setDias] = useState(15);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const data: ExtenderPruebaRequest = { dias, motivo };
    const resp = await extenderPrueba(codTaller, data);
    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    onOpenChange(false);
    setMotivo("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extender prueba</DialogTitle>
          <DialogDescription>Solo aplica mientras el taller sigue en prueba.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="dias">Días a extender</Label>
            <Input
              id="dias"
              type="number"
              min={1}
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="motivo-prueba">Motivo</Label>
            <Textarea id="motivo-prueba" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={guardando || !motivo.trim()}>
            {guardando ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PagoManualDialog({ codTaller, open, onOpenChange }: DialogBaseProps) {
  const [monto, setMonto] = useState(49000);
  const [detalleMedio, setDetalleMedio] = useState("Transferencia");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const data: PagoManualRequest = { monto, detalleMedio, motivo };
    const resp = await registrarPagoManual(codTaller, data);
    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    onOpenChange(false);
    setMotivo("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago manual</DialogTitle>
          <DialogDescription>
            Activa o extiende la suscripción igual que un pago de Wompi.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              min={1}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="medio">Medio de pago</Label>
            <Input
              id="medio"
              placeholder="Efectivo / Transferencia / Nequi"
              value={detalleMedio}
              onChange={(e) => setDetalleMedio(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="motivo-pago">Motivo</Label>
            <Textarea id="motivo-pago" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={guardando || !motivo.trim() || !detalleMedio.trim()}>
            {guardando ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuspenderReactivarDialog({
  codTaller,
  open,
  onOpenChange,
  accion,
}: DialogBaseProps & { accion: "suspender" | "reactivar" }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const data: SuspenderReactivarRequest = { motivo };
    const resp =
      accion === "suspender"
        ? await suspenderTaller(codTaller, data)
        : await reactivarTaller(codTaller, data);
    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    onOpenChange(false);
    setMotivo("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{accion === "suspender" ? "Suspender taller" : "Reactivar taller"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="motivo-estado">Motivo</Label>
            <Textarea id="motivo-estado" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={guardando || !motivo.trim()}>
            {guardando ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AjustarPrecioDialog({
  codTaller,
  open,
  onOpenChange,
  precioActual,
}: DialogBaseProps & { precioActual: number | null | undefined }) {
  const [precio, setPrecio] = useState(precioActual ?? 0);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const data: AjustarPrecioRequest = { precioSuscTal: precio, motivo };
    const resp = await ajustarPrecio(codTaller, data);
    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    onOpenChange(false);
    setMotivo("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar precio pactado</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="precio">Nuevo precio</Label>
            <Input
              id="precio"
              type="number"
              min={0}
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="motivo-precio">Motivo</Label>
            <Textarea id="motivo-precio" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={guardando || !motivo.trim()}>
            {guardando ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
