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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleDollarSign } from "lucide-react";
import { registrarPagoOrden } from "../actions";
import { METODOS_PAGO, MetodoPago } from "@/lib/types/pagoOrden";

interface RegistrarPagoDialogProps {
  consecutivo: number;
  saldoOt: number;
}

export function RegistrarPagoDialog({ consecutivo, saldoOt }: RegistrarPagoDialogProps) {
  const [open, setOpen] = useState(false);
  const [valorPago, setValorPago] = useState<string>(
    saldoOt > 0 ? String(Math.round(saldoOt)) : ""
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);

  const valorNumerico = Number(valorPago);
  const valorValido = valorPago.trim().length > 0 && valorNumerico > 0;

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const resp = await registrarPagoOrden(consecutivo, {
      valorPago: valorNumerico,
      metodoPago,
      referenciaPago: referenciaPago.trim() || undefined,
    });
    if (resp.error) {
      setGuardando(false);
      setError(resp.error);
      return;
    }
    // Mismo patrón que anular-orden-dialog: el saldo y la lista de abonos son
    // de un componente cliente con su propio fetch -- un reload completo es
    // lo único que los deja al día.
    window.location.reload();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CircleDollarSign className="mr-2 h-4 w-4" />
        Registrar Pago
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago en orden #{consecutivo}</DialogTitle>
            <DialogDescription>
              Los pagos no se pueden editar ni borrar después -- solo anular con motivo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="valor-pago">Valor</Label>
              <Input
                id="valor-pago"
                type="number"
                min="0"
                step="1"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="metodo-pago">Método de pago</Label>
              <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as MetodoPago)}>
                <SelectTrigger id="metodo-pago">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METODOS_PAGO.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="referencia-pago">Referencia (opcional)</Label>
              <Input
                id="referencia-pago"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                placeholder="Ej. número de transferencia"
                maxLength={80}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmar} disabled={guardando || !valorValido}>
              {guardando ? "Guardando..." : "Registrar pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
