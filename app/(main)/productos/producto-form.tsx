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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Producto, Impuesto, ImpuestoRequest } from "@/lib/types/producto";
import {
  createProductoSchema,
  updateProductoSchema,
  CreateProductoFormData,
} from "@/lib/schemas/producto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { crearProducto, editarProducto } from "./actions";

interface ProductoFormProps {
  producto?: Producto;
  isEdit?: boolean;
}

// Impuestos disponibles según la documentación del backend
const IMPUESTOS_DISPONIBLES: Impuesto[] = [
  { codImp: 1, nombreImp: "IVA", porcentaje: 19.0 },
  { codImp: 2, nombreImp: "IVA Reducido", porcentaje: 5.0 },
  { codImp: 3, nombreImp: "Impuesto al Consumo", porcentaje: 8.0 },
  { codImp: 4, nombreImp: "ICA", porcentaje: 1.0 },
];

export default function ProductoForm({
  producto,
  isEdit = false,
}: ProductoFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [impuestosSeleccionados, setImpuestosSeleccionados] = useState<
    ImpuestoRequest[]
  >([]);

  const form = useForm<CreateProductoFormData>({
    resolver: zodResolver(isEdit ? updateProductoSchema : createProductoSchema),
    defaultValues: {
      nombrePro: producto?.nombrePro || "",
      descripcionPro: producto?.descripcionPro || "",
      precioPro: producto?.precioPro || 0,
      stockPro: producto?.stockPro || 0,
      stockProMin: producto?.stockProMin || 0,
      impuestos: [],
    },
  });

  useEffect(() => {
    if (producto && producto.impuestos) {
      // Primero establecer los impuestos seleccionados
      const impuestosProducto = producto.impuestos.map((imp) => ({
        codImp: imp.codImp,
        porcentaje: imp.porcentaje,
      }));

      // Establecer los impuestos y resetear el formulario
      setImpuestosSeleccionados(impuestosProducto);

      // Usar setTimeout para asegurar que el estado se actualice antes del reset
      setTimeout(() => {
        form.reset({
          nombrePro: producto.nombrePro,
          descripcionPro: producto.descripcionPro || "",
          precioPro: producto.precioPro,
          stockPro: producto.stockPro,
          stockProMin: producto.stockProMin,
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

  const formatearPrecio = (valor: string) => {
    // Eliminar todo excepto números
    const soloNumeros = valor.replace(/\D/g, "");
    // Formatear con separadores de miles
    return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, ""); // Solo números
    form.setValue("precioPro", Number(valor));
  };

  const handleStockChange = (fieldName: "stockPro" | "stockProMin") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Eliminar todo excepto números
    const valor = e.target.value.replace(/\D/g, "");
    form.setValue(fieldName, Number(valor));
  };

  const formatearNumero = (valor: string | number) => {
    // Convertir a string y eliminar todo excepto números
    const soloNumeros = valor.toString().replace(/\D/g, "");
    // Si está vacío, retornar "0"
    if (!soloNumeros) return "0";
    // Eliminar ceros a la izquierda pero mantener al menos un 0
    const sinCerosIzq = soloNumeros.replace(/^0+/, "") || "0";
    return sinCerosIzq;
  };

  async function onSubmit(values: CreateProductoFormData) {
    setLoading(true);
    setError(undefined);

    try {
      const data = {
        ...values,
        impuestos: impuestosSeleccionados.length > 0 ? impuestosSeleccionados : undefined,
      };

      if (isEdit && producto) {
        const resp = await editarProducto(producto.codPro, data);

        if (resp?.error) {
          setError(resp.error);
        }
      } else {
        const resp = await crearProducto(data);

        if (resp?.error) {
          setError(resp.error);
        } else {
          form.reset();
          setImpuestosSeleccionados([]);
        }
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  // Usar useWatch para evitar re-renders innecesarios
  const precioPro = useWatch({
    control: form.control,
    name: "precioPro",
    defaultValue: 0,
  });

  // Memoizar los cálculos para evitar re-renders
  const precioBase = useMemo(() => Number(precioPro) || 0, [precioPro]);

  const totalImpuestos = useMemo(() => {
    return impuestosSeleccionados.reduce((sum, imp) => {
      return sum + (precioBase * imp.porcentaje) / 100;
    }, 0);
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

                {/* Fila: Precio y Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Precio */}
                  <FormField
                    control={form.control}
                    name="precioPro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Base *</FormLabel>
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
                          Precio sin impuestos (COP)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stock Actual */}
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

                  {/* Stock Mínimo */}
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
                </div>
              </div>
            </CardContent>
          </Card>

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
                  {IMPUESTOS_DISPONIBLES.map((impuesto) => {
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
                      const impInfo = IMPUESTOS_DISPONIBLES.find(
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
