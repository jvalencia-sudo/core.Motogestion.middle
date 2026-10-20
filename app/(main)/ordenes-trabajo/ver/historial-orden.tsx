"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistorialEvento } from "@/lib/types/ordenTrabajo";
import { obtenerHistorialOrden } from "../actions";

interface HistorialOrdenProps {
  consecutivo: number;
}

const TABLA_LABELS: Record<string, string> = {
  ordenes_trabajo: "Orden",
  detalle_orden_trabajo: "Producto/servicio",
};

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

/**
 * F1-05: solo se renderiza desde ver/page.tsx cuando el usuario es Admin (el
 * backend también lo protege con 403) -- evita el viaje a quien no lo verá.
 */
export function HistorialOrden({ consecutivo }: HistorialOrdenProps) {
  const [eventos, setEventos] = useState<HistorialEvento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerHistorialOrden(consecutivo).then((data) => {
      setEventos(data);
      setCargando(false);
    });
  }, [consecutivo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de cambios</CardTitle>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos registrados.</p>
        ) : (
          <div className="space-y-2">
            {eventos.map((ev, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 border-b pb-2 text-sm last:border-0"
              >
                <div>
                  <span className="font-medium">{ev.evento}</span>{" "}
                  <span className="text-muted-foreground">
                    · {TABLA_LABELS[ev.tabla] ?? ev.tabla}
                  </span>
                  <p className="text-xs text-muted-foreground">Por {ev.usuario}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatearFecha(ev.fecha)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
