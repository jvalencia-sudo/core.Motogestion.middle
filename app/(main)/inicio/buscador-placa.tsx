"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Phone, Bike, UserPlus, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { normalizarPlaca } from "@/lib/utils/placa";
import { OrdenTrabajoResumen } from "@/lib/types/ordenTrabajo";

import { buscarPorPlaca, ResultadoBusquedaPlaca } from "./actions";

// Estados en los que una orden sigue "abierta" (coincide con el seed de ot_estados).
const ESTADOS_ABIERTOS = ["Pendiente", "En Proceso", "Garantía"];

function badgeVariant(estado: string): "outline" | "default" | "secondary" {
  if (estado === "Pendiente") return "outline";
  if (estado === "En Proceso") return "default";
  return "secondary";
}

function formatearMoneda(valor?: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor ?? 0);
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("T")[0].split("-");
  return `${dia}/${mes}/${anio}`;
}

function FilaHistorial({ orden }: { orden: OrdenTrabajoResumen }) {
  return (
    <Link
      href={`/ordenes-trabajo/ver?consecutivo=${orden.consecutivoOt}`}
      className="flex flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatearFecha(orden.fechaElaboracionOt)}</span>
          <Badge variant={badgeVariant(orden.estadoOt)}>{orden.estadoOt}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Intl.NumberFormat("es-CO").format(orden.kilometrajeIngresoOt)} km
          {orden.trabajos ? ` · ${orden.trabajos}` : ""}
        </span>
      </div>
      <span className="font-semibold">{formatearMoneda(orden.totalOt)}</span>
    </Link>
  );
}

export function BuscadorPlaca() {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoBusquedaPlaca | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    const placa = normalizarPlaca(valor);
    if (!placa) return;

    setLoading(true);
    const data = await buscarPorPlaca(placa);
    setResultado(data);
    setBuscado(true);
    setLoading(false);
  }

  const ordenAbierta = resultado?.historial.find((o) =>
    ESTADOS_ABIERTOS.includes(o.estadoOt)
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={buscar} className="flex gap-2">
            <Input
              value={valor}
              onChange={(e) => setValor(normalizarPlaca(e.target.value))}
              placeholder="Buscar por placa (ej: ABC123)"
              maxLength={6}
              autoFocus
              className="h-14 text-2xl font-semibold tracking-wider"
            />
            <Button type="submit" disabled={loading || !valor} className="h-14 px-6">
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Search className="size-5" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {buscado && !resultado && (
        <Alert>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              No se encontró ninguna moto con la placa <strong>{normalizarPlaca(valor)}</strong>.
            </span>
            <Link href="/ordenes-trabajo/crear">
              <Button variant="secondary" size="sm">
                <UserPlus className="mr-2 size-4" />
                Registrar moto y abrir orden
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {resultado && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="size-5" />
                {resultado.moto.placaMot} — {resultado.moto.marca} {resultado.moto.modeloMot}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Color / cilindraje</p>
                <p className="font-medium">
                  {resultado.moto.colorMot} · {resultado.moto.cilindrajeMot} cc
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Propietario</p>
                <p className="font-medium">{resultado.moto.propietario}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <a
                  href={`tel:${resultado.moto.telefonoCli}`}
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Phone className="size-4" />
                  {resultado.moto.telefonoCli}
                </a>
              </div>
            </CardContent>
          </Card>

          {ordenAbierta && (
            <Alert>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Tiene una orden abierta (<strong>{ordenAbierta.estadoOt}</strong>), del{" "}
                  {formatearFecha(ordenAbierta.fechaElaboracionOt)}.
                </span>
                <Link href={`/ordenes-trabajo/ver?consecutivo=${ordenAbierta.consecutivoOt}`}>
                  <Button size="sm">Ver orden</Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {resultado.historial.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Esta moto no tiene órdenes de trabajo todavía.
                </p>
              ) : (
                resultado.historial.map((orden) => (
                  <FilaHistorial key={orden.consecutivoOt} orden={orden} />
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
