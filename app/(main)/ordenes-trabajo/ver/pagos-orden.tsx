"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { anularPagoOrden, listarPagosOrden } from "../actions";
import { METODOS_PAGO, PagoOrden } from "@/lib/types/pagoOrden";
import { RegistrarPagoDialog } from "./registrar-pago-dialog";

interface PagosOrdenProps {
  consecutivo: number;
  totalOt: number;
  totalPagado: number;
  saldoOt: number;
  puedeRegistrar: boolean;
  puedeAnular: boolean;
  ordenAnulada: boolean;
}

const MOTIVO_MIN = 5;

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: string): string {
  try {
    return new Date(fecha).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fecha;
  }
}

function metodoLabel(metodo: string): string {
  return METODOS_PAGO.find((m) => m.value === metodo)?.label ?? metodo;
}

function AnularPagoDialog({
  consecutivo,
  pago,
}: {
  consecutivo: number;
  pago: PagoOrden;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    setGuardando(true);
    setError(undefined);
    const resp = await anularPagoOrden(consecutivo, pago.codPagoOrden, motivo);
    if (resp.error) {
      setGuardando(false);
      setError(resp.error);
      return;
    }
    window.location.reload();
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Ban className="mr-1 h-3.5 w-3.5" />
        Anular
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular pago de {formatearMoneda(pago.valorPago)}</DialogTitle>
            <DialogDescription>
              Este pago deja de contar para el saldo de la orden. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor={`motivo-anular-pago-${pago.codPagoOrden}`}>Motivo</Label>
              <Textarea
                id={`motivo-anular-pago-${pago.codPagoOrden}`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Por qué se anula este pago"
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

/**
 * F1-07: total/pagado/saldo y la lista de abonos de una orden. Se renderiza
 * solo si el usuario tiene ver:pagos-orden (el backend también lo protege
 * con 403) -- evita el viaje inútil a quien no lo verá.
 */
export function PagosOrden({
  consecutivo,
  totalOt,
  totalPagado,
  saldoOt,
  puedeRegistrar,
  puedeAnular,
  ordenAnulada,
}: PagosOrdenProps) {
  const [pagos, setPagos] = useState<PagoOrden[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarPagosOrden(consecutivo).then((data) => {
      setPagos(data);
      setCargando(false);
    });
  }, [consecutivo]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Pagos</CardTitle>
        {puedeRegistrar && !ordenAnulada && (
          <RegistrarPagoDialog consecutivo={consecutivo} saldoOt={saldoOt} />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de la orden</p>
            <p className="text-lg font-semibold">{formatearMoneda(totalOt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pagado</p>
            <p className="text-lg font-semibold">{formatearMoneda(totalPagado)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`text-lg font-semibold ${saldoOt > 0 ? "text-destructive" : "text-green-600"}`}>
              {formatearMoneda(saldoOt)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          {cargando ? (
            <p className="text-sm text-muted-foreground pt-3">Cargando...</p>
          ) : pagos.length === 0 ? (
            <p className="text-sm text-muted-foreground pt-3">Sin abonos registrados.</p>
          ) : (
            <div className="space-y-2 pt-3">
              {pagos.map((pago) => (
                <div
                  key={pago.codPagoOrden}
                  className="flex items-center justify-between gap-4 border-b pb-2 text-sm last:border-0"
                >
                  <div>
                    <span className={`font-medium ${pago.anuladoPago ? "line-through text-muted-foreground" : ""}`}>
                      {formatearMoneda(pago.valorPago)}
                    </span>{" "}
                    <span className="text-muted-foreground">· {metodoLabel(pago.metodoPago)}</span>
                    {pago.referenciaPago && (
                      <span className="text-muted-foreground"> · {pago.referenciaPago}</span>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatearFecha(pago.fechaPago)} · {pago.usuarioPago}
                    </p>
                    {pago.anuladoPago && (
                      <p className="text-xs text-destructive">
                        Anulado: {pago.motivoAnulacionPago}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pago.anuladoPago ? (
                      <Badge variant="destructive">Anulado</Badge>
                    ) : (
                      puedeAnular && <AnularPagoDialog consecutivo={consecutivo} pago={pago} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
