"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, PackagePlus, ClipboardCheck, History } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MovimientoInventario, ProductoStock } from "@/lib/types/inventario";
import { cn } from "@/lib/utils";

import {
  aplicarTomaFisica,
  getMovimientos,
  getProductosStock,
  registrarEntrada,
} from "./actions";

const TIPO_STYLES: Record<string, string> = {
  ENTRADA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  SALIDA: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  AJUSTE: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
};

const COLUMNS: ColumnDef<MovimientoInventario>[] = [
  { accessorKey: "fecha", header: "Fecha" },
  { accessorKey: "nombrePro", header: "Producto" },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline" className={cn("border-0", TIPO_STYLES[row.original.tipo])}>
        {row.original.tipo}
      </Badge>
    ),
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => {
      const c = row.original.cantidad;
      return (
        <span className={c >= 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>
          {c >= 0 ? `+${c}` : c}
        </span>
      );
    },
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.stockAnt} → <span className="font-medium text-foreground">{row.original.stockNue}</span>
      </span>
    ),
  },
  { accessorKey: "motivo", header: "Motivo" },
  { accessorKey: "referencia", header: "Ref." },
];

export default function InventarioPage() {
  const { toast } = useToast();
  const [productos, setProductos] = React.useState<ProductoStock[]>([]);
  const [movimientos, setMovimientos] = React.useState<MovimientoInventario[]>([]);
  const [cargando, setCargando] = React.useState(true);

  // Entrada
  const [entProd, setEntProd] = React.useState<string>("");
  const [entCant, setEntCant] = React.useState<string>("");
  const [entMotivo, setEntMotivo] = React.useState<string>("");
  const [guardandoEnt, setGuardandoEnt] = React.useState(false);

  // Toma física
  const [conteo, setConteo] = React.useState<Record<number, string>>({});
  const [guardandoToma, setGuardandoToma] = React.useState(false);

  const cargar = React.useCallback(async () => {
    const [prods, movs] = await Promise.all([getProductosStock(), getMovimientos()]);
    setProductos(prods);
    setMovimientos(movs);
    setCargando(false);
  }, []);

  React.useEffect(() => {
    cargar();
  }, [cargar]);

  async function onEntrada(e: React.FormEvent) {
    e.preventDefault();
    const cod = Number(entProd);
    const cant = Number(entCant);
    if (!cod || !cant || cant <= 0) {
      toast({ title: "Datos incompletos", description: "Elige un producto y una cantidad válida." });
      return;
    }
    setGuardandoEnt(true);
    const res = await registrarEntrada(cod, cant, entMotivo.trim() || undefined);
    setGuardandoEnt(false);
    if (res.ok) {
      toast({ title: "Entrada registrada", description: "El stock se actualizó." });
      setEntCant("");
      setEntMotivo("");
      cargar();
    } else {
      toast({ title: "No se pudo registrar", description: res.error ?? "Intenta de nuevo." });
    }
  }

  async function onTomaFisica() {
    const items = productos
      .map((p) => ({ codPro: p.codPro, cantidadFisica: Number(conteo[p.codPro] ?? p.stock) }))
      .filter((it, i) => it.cantidadFisica !== productos[i].stock && !Number.isNaN(it.cantidadFisica));
    if (items.length === 0) {
      toast({ title: "Sin cambios", description: "No hay diferencias para ajustar." });
      return;
    }
    setGuardandoToma(true);
    const res = await aplicarTomaFisica(items, "Toma física");
    setGuardandoToma(false);
    if (res.ok) {
      toast({ title: "Toma física aplicada", description: `${res.ajustados} producto(s) ajustado(s).` });
      setConteo({});
      cargar();
    } else {
      toast({ title: "No se pudo aplicar", description: res.error ?? "Intenta de nuevo." });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Registra entradas, haz la toma física y consulta el historial de movimientos.
        </p>
      </div>

      <Tabs defaultValue="movimientos">
        <TabsList>
          <TabsTrigger value="movimientos">
            <History className="mr-1 size-4" /> Movimientos
          </TabsTrigger>
          <TabsTrigger value="entrada">
            <PackagePlus className="mr-1 size-4" /> Entrada
          </TabsTrigger>
          <TabsTrigger value="toma">
            <ClipboardCheck className="mr-1 size-4" /> Toma física
          </TabsTrigger>
        </TabsList>

        {/* MOVIMIENTOS */}
        <TabsContent value="movimientos" className="mt-4">
          {cargando ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <DataTable columns={COLUMNS} data={movimientos} />
          )}
        </TabsContent>

        {/* ENTRADA */}
        <TabsContent value="entrada" className="mt-4">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Registrar entrada de stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onEntrada} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Producto</Label>
                  <Select value={entProd} onValueChange={setEntProd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((p) => (
                        <SelectItem key={p.codPro} value={String(p.codPro)}>
                          {p.nombre} (stock: {p.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cant">Cantidad que entra</Label>
                  <Input
                    id="cant"
                    type="number"
                    min={1}
                    value={entCant}
                    onChange={(e) => setEntCant(e.target.value)}
                    placeholder="Ej. 20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="motivo">Motivo (opcional)</Label>
                  <Input
                    id="motivo"
                    value={entMotivo}
                    onChange={(e) => setEntMotivo(e.target.value)}
                    placeholder="Ej. Compra a proveedor"
                  />
                </div>
                <Button type="submit" disabled={guardandoEnt}>
                  {guardandoEnt && <Loader2 className="mr-1 size-4 animate-spin" />}
                  Registrar entrada
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOMA FÍSICA */}
        <TabsContent value="toma" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <CardTitle>Toma física</CardTitle>
              <Button onClick={onTomaFisica} disabled={guardandoToma}>
                {guardandoToma && <Loader2 className="mr-1 size-4 animate-spin" />}
                Aplicar ajustes
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Stock sistema</TableHead>
                      <TableHead className="text-center">Cantidad real</TableHead>
                      <TableHead className="text-center">Diferencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((p) => {
                      const real = conteo[p.codPro] ?? String(p.stock);
                      const diff = Number(real) - p.stock;
                      return (
                        <TableRow key={p.codPro}>
                          <TableCell>{p.nombre}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{p.stock}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min={0}
                              value={real}
                              onChange={(e) =>
                                setConteo((c) => ({ ...c, [p.codPro]: e.target.value }))
                              }
                              className="mx-auto h-8 w-24 text-center"
                            />
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-center font-medium",
                              diff > 0 && "text-emerald-600",
                              diff < 0 && "text-rose-600",
                              diff === 0 && "text-muted-foreground",
                            )}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
