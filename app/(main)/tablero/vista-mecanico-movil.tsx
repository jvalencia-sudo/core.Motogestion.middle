"use client";

import * as React from "react";
import { Bike, CheckCircle2, PackageSearch, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TableroItem } from "@/lib/types/tablero";
import { cn } from "@/lib/utils";

const NOTA_MIN = 3;

// F1-08: el mecánico solo mueve sus órdenes entre Pendiente/En Proceso/
// Completada (ESTADOS_MECANICO en el backend) -- Entregada es trabajo de
// recepción (cobro, kilometraje de salida), nunca de esta pantalla.
const SECCIONES: { cod: number; titulo: string }[] = [
  { cod: 1, titulo: "Pendientes" },
  { cod: 2, titulo: "En proceso" },
  { cod: 3, titulo: "Completadas" },
];

interface VistaMecanicoMovilProps {
  items: TableroItem[];
  onCambiarEstado: (consecutivoOt: number, codEstado: number) => Promise<void>;
  onNecesitoRepuesto: (
    consecutivoOt: number,
    nota: string,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export function VistaMecanicoMovil({
  items,
  onCambiarEstado,
  onNecesitoRepuesto,
}: VistaMecanicoMovilProps) {
  const [notaPara, setNotaPara] = React.useState<number | null>(null);
  const activas = items.filter((it) => [1, 2, 3].includes(it.codEstado ?? -1));

  if (activas.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <CheckCircle2 className="size-10" />
        <p className="text-base font-medium">No tienes órdenes pendientes</p>
        <p className="text-sm">Cuando te asignen una orden, aparece aquí.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {SECCIONES.map((sec) => {
        const ordenes = activas.filter((it) => it.codEstado === sec.cod);
        if (ordenes.length === 0) return null;
        return (
          <section key={sec.cod} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 px-1 text-sm font-semibold text-muted-foreground">
              {sec.titulo}
              <Badge variant="secondary">{ordenes.length}</Badge>
            </h2>
            <div className="flex flex-col gap-3">
              {ordenes.map((it) => (
                <OrdenCardMovil
                  key={it.consecutivoOt}
                  item={it}
                  onCambiarEstado={onCambiarEstado}
                  onNecesitoRepuesto={() => setNotaPara(it.consecutivoOt)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <NotaRepuestoDialog
        consecutivoOt={notaPara}
        onClose={() => setNotaPara(null)}
        onConfirmar={onNecesitoRepuesto}
      />
    </div>
  );
}

function OrdenCardMovil({
  item,
  onCambiarEstado,
  onNecesitoRepuesto,
}: {
  item: TableroItem;
  onCambiarEstado: (consecutivoOt: number, codEstado: number) => Promise<void>;
  onNecesitoRepuesto: () => void;
}) {
  const [moviendo, setMoviendo] = React.useState(false);
  const puedeEmpezar = item.codEstado === 1;
  const puedeTerminar = item.codEstado === 2;

  async function mover(codEstado: number) {
    setMoviendo(true);
    await onCambiarEstado(item.consecutivoOt, codEstado);
    setMoviendo(false);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted-foreground">
              OT #{item.consecutivoOt}
            </span>
            <span className="flex items-center gap-1.5 text-base font-semibold leading-tight">
              <Bike className="size-4 shrink-0" />
              {item.marca} {item.placa}
            </span>
            {item.cliente && (
              <span className="text-sm text-muted-foreground">{item.cliente}</span>
            )}
          </div>
        </div>

        {item.servicio && (
          <p className="rounded-md bg-muted/50 p-2 text-sm leading-snug">{item.servicio}</p>
        )}

        {item.codEstado === 3 ? (
          <Badge variant="secondary" className="w-fit gap-1">
            <CheckCircle2 className="size-3.5" />
            Completada -- esperando entrega
          </Badge>
        ) : (
          <div className="flex flex-col gap-2">
            {puedeEmpezar && (
              <Button
                size="lg"
                className="h-14 text-base"
                disabled={moviendo}
                onClick={() => mover(2)}
              >
                <PlayCircle className="mr-2 size-5" />
                Empecé
              </Button>
            )}
            {puedeTerminar && (
              <Button
                size="lg"
                className="h-14 text-base"
                disabled={moviendo}
                onClick={() => mover(3)}
              >
                <CheckCircle2 className="mr-2 size-5" />
                Terminé
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="h-12 text-base"
              disabled={moviendo}
              onClick={onNecesitoRepuesto}
            >
              <PackageSearch className="mr-2 size-5" />
              Necesito repuesto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotaRepuestoDialog({
  consecutivoOt,
  onClose,
  onConfirmar,
}: {
  consecutivoOt: number | null;
  onClose: () => void;
  onConfirmar: (consecutivoOt: number, nota: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const { toast } = useToast();
  const [nota, setNota] = React.useState("");
  const [guardando, setGuardando] = React.useState(false);

  React.useEffect(() => {
    if (consecutivoOt === null) setNota("");
  }, [consecutivoOt]);

  async function confirmar() {
    if (consecutivoOt === null) return;
    setGuardando(true);
    const resp = await onConfirmar(consecutivoOt, nota.trim());
    setGuardando(false);
    if (!resp.ok) {
      toast({ title: "No se pudo guardar la nota", description: resp.error ?? "Intenta de nuevo." });
      return;
    }
    toast({ title: "Nota guardada", description: "Se avisó que necesitas un repuesto." });
    onClose();
  }

  return (
    <Dialog open={consecutivoOt !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Necesito repuesto</DialogTitle>
          <DialogDescription>
            Esta nota queda en la orden para que recepción/admin la vean. No cambia el estado de la orden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: necesito pastillas de freno delanteras"
            className="min-h-24 text-base"
            autoFocus
          />
          {nota.trim().length > 0 && nota.trim().length < NOTA_MIN && (
            <p className="text-xs text-destructive">
              Escribe al menos {NOTA_MIN} caracteres
            </p>
          )}
        </div>
        <DialogFooter className={cn("gap-2")}>
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={confirmar}
            disabled={guardando || nota.trim().length < NOTA_MIN}
          >
            {guardando ? "Guardando..." : "Avisar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
