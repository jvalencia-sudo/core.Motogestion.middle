"use client";

import * as React from "react";
import { Bike, Clock, GripVertical, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TableroItem, TableroMecanico } from "@/lib/types/tablero";
import { cn } from "@/lib/utils";

import { cambiarEstadoOrden, getTablero } from "./actions";

const TODOS = "todos";
// Estados a los que un mecánico puede mover sus OT
const ESTADOS_MECANICO = [1, 2, 3];

// Columnas del tablero en orden de flujo
const COLUMNAS = [
  { cod: 1, titulo: "Pendiente", barra: "bg-amber-500" },
  { cod: 2, titulo: "En Proceso", barra: "bg-sky-500" },
  { cod: 3, titulo: "Completada", barra: "bg-emerald-500" },
  { cod: 4, titulo: "Entregada", barra: "bg-slate-500" },
  { cod: 6, titulo: "Garantía", barra: "bg-violet-500" },
  { cod: 5, titulo: "Cancelada", barra: "bg-rose-500" },
];

function diasEnTaller(fecha: string | null): number | null {
  if (!fecha) return null;
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const ini = new Date(y, m - 1, d);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  ini.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((hoy.getTime() - ini.getTime()) / 86400000));
}
function textoDias(n: number | null): string {
  if (n === null) return "";
  if (n === 0) return "hoy";
  if (n === 1) return "1 día";
  return `${n} días`;
}

export default function TableroPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<TableroItem[]>([]);
  const [mecanicos, setMecanicos] = React.useState<TableroMecanico[]>([]);
  const [esGestor, setEsGestor] = React.useState(false);
  const [seleccion, setSeleccion] = React.useState<string>(TODOS);
  const [cargando, setCargando] = React.useState(true);
  const [overCol, setOverCol] = React.useState<number | null>(null);

  const cargar = React.useCallback(async (mec?: string) => {
    const res = await getTablero(mec);
    if (res) {
      setEsGestor(res.esGestor);
      setMecanicos(res.mecanicos);
      setItems(res.items);
    }
    setCargando(false);
  }, []);

  React.useEffect(() => {
    setCargando(true);
    cargar(seleccion === TODOS ? undefined : seleccion);
  }, [seleccion, cargar]);

  function puedeSoltar(cod: number): boolean {
    return esGestor || ESTADOS_MECANICO.includes(cod);
  }

  async function mover(consecutivoOt: number, codDestino: number) {
    const it = items.find((i) => i.consecutivoOt === consecutivoOt);
    if (!it || it.codEstado === codDestino) return;
    if (!puedeSoltar(codDestino)) {
      toast({ title: "No permitido", description: "No puedes mover la orden a ese estado." });
      return;
    }
    const previo = it.codEstado;
    // optimista
    setItems((arr) =>
      arr.map((i) => (i.consecutivoOt === consecutivoOt ? { ...i, codEstado: codDestino } : i)),
    );
    const res = await cambiarEstadoOrden(consecutivoOt, codDestino);
    if (!res.ok) {
      // revertir
      setItems((arr) =>
        arr.map((i) => (i.consecutivoOt === consecutivoOt ? { ...i, codEstado: previo } : i)),
      );
      toast({ title: "No se pudo mover", description: res.error ?? "Intenta de nuevo." });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {esGestor ? "Tablero del taller" : "Mi tablero"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Arrastra una orden a otra columna para cambiar su estado.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-lg border bg-card px-4 py-2 text-sm">
          {cargando ? (
            "Cargando..."
          ) : (
            <>
              <span className="text-2xl font-bold">{items.length}</span>{" "}
              <span className="text-muted-foreground">
                {items.length === 1 ? "orden" : "órdenes"}
              </span>
            </>
          )}
        </div>

        {esGestor && (
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <Select value={seleccion} onValueChange={setSeleccion}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Mecánico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos los mecánicos</SelectItem>
                {mecanicos.map((m) => (
                  <SelectItem key={m.documentoUsu} value={m.documentoUsu}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tablero Kanban */}
      <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
        {COLUMNAS.map((col) => {
          const ordenes = items.filter((it) => it.codEstado === col.cod);
          const soltar = puedeSoltar(col.cod);
          return (
            <div
              key={col.cod}
              onDragOver={(e) => {
                if (soltar) {
                  e.preventDefault();
                  setOverCol(col.cod);
                }
              }}
              onDragLeave={() => setOverCol((c) => (c === col.cod ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                const id = Number(e.dataTransfer.getData("text/plain"));
                if (id) mover(id, col.cod);
              }}
              className={cn(
                "flex w-64 shrink-0 flex-col gap-2 rounded-lg border bg-muted/30 p-2 transition-colors",
                overCol === col.cod && soltar && "ring-2 ring-primary",
                overCol === col.cod && !soltar && "opacity-60",
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("size-2.5 rounded-full", col.barra)} />
                  {col.titulo}
                </span>
                <Badge variant="secondary">{ordenes.length}</Badge>
              </div>

              <div className="flex min-h-16 flex-col gap-2">
                {ordenes.map((it) => {
                  const dias = diasEnTaller(it.fecha);
                  const alerta = dias !== null && dias >= 3 && (it.codEstado === 1 || it.codEstado === 2);
                  return (
                    <Card
                      key={it.consecutivoOt}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(it.consecutivoOt));
                      }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <CardContent className="flex flex-col gap-1.5 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <GripVertical className="size-3" />
                            OT #{it.consecutivoOt}
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-1 text-xs",
                              alerta ? "font-medium text-rose-600" : "text-muted-foreground",
                            )}
                          >
                            <Clock className="size-3" />
                            {textoDias(dias)}
                          </span>
                        </div>
                        <span className="font-medium leading-tight">{it.cliente ?? "Cliente"}</span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Bike className="size-3.5 shrink-0" />
                          {it.marca} {it.placa}
                        </span>
                        {it.servicio && (
                          <span className="line-clamp-2 text-xs text-muted-foreground">
                            {it.servicio}
                          </span>
                        )}
                        {esGestor && it.mecanico && (
                          <span className="mt-0.5 text-xs font-medium">{it.mecanico}</span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
