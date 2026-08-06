"use client";

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Producto,
  Impuesto,
  ImpuestoRequest,
  ComponentePaquete,
} from "@/lib/types/producto";
import {
  createProductoSchema,
  updateProductoSchema,
  CreateProductoFormData,
} from "@/lib/schemas/producto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { crearProducto, editarProducto } from "./actions";

// Candidato a componente de un paquete (producto BIEN o SERVICIO).
export interface ProductoCandidato {
  codPro: number;
  nombrePro: string;
  tipoPro: "BIEN" | "SERVICIO" | "PAQUETE";
}

interface ProductoFormProps {
  producto?: Producto;
  isEdit?: boolean;
  // Productos disponibles como componentes de un paquete.
  productosDisponibles?: ProductoCandidato[];
  // Catálogo de impuestos del taller (viene del backend, no hardcodeado).
  impuestosDisponibles?: Impuesto[];
}

const TIPOS_PRODUCTO: { value: "BIEN" | "SERVICIO" | "PAQUETE"; label: string; hint: string }[] = [
  { value: "BIEN", label: "Producto (repuesto/insumo)", hint: "Maneja stock de inventario." },
  { value: "SERVICIO", label: "Servicio / Mano de obra", hint: "Se cobra por horas o valor; no maneja stock." },
  { value: "PAQUETE", label: "Paquete / Combo", hint: "Precio fijo compuesto por otros productos." },
];

export default function ProductoForm({
  producto,
  isEdit = false,
  productosDisponibles = [],
  impuestosDisponibles = [],
}: ProductoFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [impuestosSeleccionados, setImpuestosSeleccionados] = useState<
    ImpuestoRequest[]
  >([]);
  const [componentesSeleccionados, setComponentesSeleccionados] = useState<
    ComponentePaquete[]
  >([]);

  const form = useForm<CreateProductoFormData>({
    resolver: zodResolver(isEdit ? updateProductoSchema : createProductoSchema),
    defaultValues: {
      nombrePro: producto?.nombrePro || "",
      descripcionPro: producto?.descripcionPro || "",
      tipoPro: producto?.tipoPro || "BIEN",
      precioPro: producto?.precioPro || 0,
      stockPro: producto?.stockPro ?? 0,
      stockProMin: producto?.stockProMin ?? 0,
      impuestos: [],
    },
  });

  useEffect(() => {
    if (producto) {
      const impuestosProducto = (producto.impuestos || []).map((imp) => ({
        codImp: imp.codImp,
        porcentaje: imp.porcentaje,
      }));
      setImpuestosSeleccionados(impuestosProducto);
      setComponentesSeleccionados(producto.componentes || []);

      setTimeout(() => {
        form.reset({
          nombrePro: producto.nombrePro,
          descripcionPro: producto.descripcionPro || "",
          tipoPro: producto.tipoPro,
          precioPro: producto.precioPro,
          stockPro: producto.stockPro ?? 0,
          stockProMin: producto.stockProMin ?? 0,
          impuestos: impuestosProducto,
        });
      }, 0);
    }
  }, [producto, form]);

  const toggleImpuesto = (impuesto: Impuesto) => {
    const existe = impuestosSeleccionados.find(
      (i) => i.codImp === impuesto.codImp
    );

    if (existe) {
      setImpuestosSeleccionados(
        impuestosSeleccionados.filter((i) => i.codImp !== impuesto.codImp)
      );
    } else {
      setImpuestosSeleccionados([
        ...impuestosSeleccionados,
        { codImp: impuesto.codImp, porcentaje: impuesto.porcentaje },
      ]);
    }
  };

  const actualizarPorcentajeImpuesto = (codImp: number, porcentaje: number) => {
    setImpuestosSeleccionados(
      impuestosSeleccionados.map((i) =>
        i.codImp === codImp ? { ...i, porcentaje } : i
      )
    );
  };

  // ---- Componentes de paquete ----
  const agregarComponente = (codPro: number) => {
    const prod = productosDisponibles.find((p) => p.codPro === codPro);
    if (!prod) return;
    if (componentesSeleccionados.some((c) => c.codProComp === codPro)) return;
    setComponentesSeleccionados([
      ...componentesSeleccionados,
      {
        codProComp: prod.codPro,
        nombrePro: prod.nombrePro,
        tipoPro: prod.tipoPro,
        cantidadComp: 1,
      },
    ]);
  };

  const quitarComponente = (codProComp: number) => {
    setComponentesSeleccionados(
      componentesSeleccionados.filter((c) => c.codProComp !== codProComp)
    );
  };

  const actualizarCantidadComponente = (codProComp: number, cantidad: number) => {
    setComponentesSeleccionados(
      componentesSeleccionados.map((c) =>
        c.codProComp === codProComp ? { ...c, cantidadComp: cantidad } : c
      )
    );
  };

  const formatearPrecio = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "");
    return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "");
    form.setValue("precioPro", Number(valor));
  };

  const handleStockChange = (fieldName: "stockPro" | "stockProMin") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valor = e.target.value.replace(/\D/g, "");
    form.setValue(fieldName, Number(valor));
  };

  const formatearNumero = (valor: string | number) => {
    const soloNumeros = valor.toString().replace(/\D/g, "");
    if (!soloNumeros) return "0";
    return soloNumeros.replace(/^0+/, "") || "0";
  };

  // Tipo actual (para condicionar stock y componentes)
  const tipoPro = useWatch({ control: form.control, name: "tipoPro", defaultValue: "BIEN" });
  const esBien = tipoPro === "BIEN";
  const esPaquete = tipoPro === "PAQUETE";

  // Candidatos: productos BIEN/SERVICIO (no paquetes) que no sean el propio ni ya elegidos.
  const candidatos = useMemo(
    () =>
      productosDisponibles.filter(
        (p) =>
          p.tipoPro !== "PAQUETE" &&
          p.codPro !== producto?.codPro &&
          !componentesSeleccionados.some((c) => c.codProComp === p.codPro)
      ),
    [productosDisponibles, componentesSeleccionados, producto?.codPro]
  );

  async function onSubmit(values: CreateProductoFormData) {
    setLoading(true);
    setError(undefined);

    try {
      if (values.tipoPro === "PAQUETE" && componentesSeleccionados.length === 0) {
        setError("Un paquete debe tener al menos un componente");
        setLoading(false);
        return;
      }

      const bien = values.tipoPro === "BIEN";
      const data = {
        ...values,
        stockPro: bien ? values.stockPro : undefined,
        stockProMin: bien ? values.stockProMin : undefined,
        impuestos: impuestosSeleccionados.length > 0 ? impuestosSeleccionados : undefined,
        componentes:
          values.tipoPro === "PAQUETE"
            ? componentesSeleccionados.map((c) => ({
                codProComp: c.codProComp,
                cantidadComp: c.cantidadComp,
              }))
            : undefined,
      };

      if (isEdit && producto) {
        const resp = await editarProducto(producto.codPro, data);
        if (resp?.error) setError(resp.error);
      } else {
        const resp = await crearProducto(data);
        if (resp?.error) {
          setError(resp.error);
        } else {
          form.reset();
          setImpuestosSeleccionados([]);
          setComponentesSeleccionados([]);
        }
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  const precioPro = useWatch({ control: form.control, name: "precioPro", defaultValue: 0 });
  const precioBase = useMemo(() => Number(precioPro) || 0, [precioPro]);
  const totalImpuestos = useMemo(() => {
    return impuestosSeleccionados.reduce(
      (sum, imp) => sum + (precioBase * imp.porcentaje) / 100,
      0
    );
  }, [impuestosSeleccionados, precioBase]);
  const precioFinal = useMemo(() => precioBase + totalImpuestos, [precioBase, totalImpuestos]);

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar producto" : "Crear producto"}
        subtitle={
          isEdit
            ? "Editar información del producto existente."
            : "Crear un nuevo producto para el taller."
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Tipo de producto */}
                <FormField
                  control={form.control}
                  name="tipoPro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIPOS_PRODUCTO.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {TIPOS_PRODUCTO.find((t) => t.value === field.value)?.hint}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombrePro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Aceite Motul 7100 10W40"
                          type="text"
                          maxLength={70}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="descripcionPro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del producto"
                          className="resize-none"
                          rows={4}
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Precio + Stock (stock solo para BIEN) */}
                <div
                  className={`grid grid-cols-1 gap-4 ${
                    esBien ? "md:grid-cols-3" : "md:grid-cols-1"
                  }`}
                >
                  <FormField
                    control={form.control}
                    name="precioPro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {esPaquete
                            ? "Precio del paquete *"
                            : tipoPro === "SERVICIO"
                            ? "Valor / tarifa *"
                            : "Precio Base *"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            type="text"
                            value={formatearPrecio(field.value?.toString() || "0")}
                            onChange={handlePrecioChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {esPaquete
                            ? "Precio fijo del combo (COP)"
                            : tipoPro === "SERVICIO"
                            ? "Valor por hora/unidad (COP)"
                            : "Precio sin impuestos (COP)"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {esBien && (
                    <>
                      <FormField
                        control={form.control}
                        name="stockPro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Actual *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0"
                                type="text"
                                value={formatearNumero(field.value?.toString() || "0")}
                                onChange={handleStockChange("stockPro")}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Unidades disponibles
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stockProMin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Mínimo *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0"
                                type="text"
                                value={formatearNumero(field.value?.toString() || "0")}
                                onChange={handleStockChange("stockProMin")}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Alerta de reorden
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Componentes del paquete (solo PAQUETE) */}
          {esPaquete && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Componentes del paquete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Agrega los productos y servicios incluidos en el combo. El
                    precio lo define el paquete; el stock de los repuestos se
                    descuenta automáticamente al usar el combo en una orden.
                  </p>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormLabel className="text-sm">Agregar componente</FormLabel>
                      <Select
                        value=""
                        onValueChange={(v) => agregarComponente(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              candidatos.length
                                ? "Selecciona un producto o servicio"
                                : "No hay productos disponibles"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {candidatos.map((p) => (
                            <SelectItem key={p.codPro} value={p.codPro.toString()}>
                              {p.nombrePro}
                              {p.tipoPro === "SERVICIO" ? " (servicio)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {componentesSeleccionados.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Aún no has agregado componentes.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {componentesSeleccionados.map((c) => (
                        <div
                          key={c.codProComp}
                          className="flex items-center gap-3 rounded-md border p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{c.nombrePro}</p>
                            <Badge variant="secondary" className="mt-1">
                              {c.tipoPro === "SERVICIO" ? "Servicio" : "Repuesto"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-xs text-muted-foreground">
                              Cantidad
                            </FormLabel>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-24"
                              value={c.cantidadComp}
                              onChange={(e) =>
                                actualizarCantidadComponente(
                                  c.codProComp,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => quitarComponente(c.codProComp)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Impuestos */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Impuestos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecciona los impuestos aplicables al producto. Puedes
                  ajustar el porcentaje de cada impuesto.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {impuestosDisponibles.map((impuesto) => {
                    const seleccionado = impuestosSeleccionados.find(
                      (i) => i.codImp === impuesto.codImp
                    );

                    return (
                      <Card
                        key={impuesto.codImp}
                        className={seleccionado ? "border-primary" : ""}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={!!seleccionado}
                              onCheckedChange={() => toggleImpuesto(impuesto)}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {impuesto.nombreImp}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Porcentaje por defecto: {impuesto.porcentaje}%
                                  </p>
                                </div>
                              </div>

                              {seleccionado && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={seleccionado.porcentaje}
                                    onChange={(e) =>
                                      actualizarPorcentajeImpuesto(
                                        impuesto.codImp,
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-24"
                                  />
                                  <span className="text-sm">%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Resumen de precios */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3">Resumen de Precios</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precio base:</span>
                      <span>
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(precioBase)}
                      </span>
                    </div>
                    {impuestosSeleccionados.map((imp) => {
                      const impInfo = impuestosDisponibles.find(
                        (i) => i.codImp === imp.codImp
                      );
                      const valorImpuesto = (precioBase * imp.porcentaje) / 100;
                      return (
                        <div key={imp.codImp} className="flex justify-between text-sm">
                          <span>
                            {impInfo?.nombreImp} ({imp.porcentaje}%):
                          </span>
                          <span>
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(valorImpuesto)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Precio final:</span>
                      <span>
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(precioFinal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear Producto"}
            </Button>
          </div>

          {error && (
            <Card className="border-destructive mt-4">
              <CardContent className="pt-4 text-destructive">{error}</CardContent>
            </Card>
          )}
        </form>
      </Form>
    </>
  );
}
