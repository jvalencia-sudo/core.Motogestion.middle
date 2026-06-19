"use client";

import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moto } from "@/lib/types/moto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearMoto, editarMoto } from "./actions";

const formSchema = z.object({
  placaMot: z
    .string()
    .min(1, "La placa es requerida")
    .refine((val) => val.length >= 5 && val.length <= 6, {
      message: "La placa debe tener entre 5 y 6 caracteres",
    }),
  modeloMot: z
    .number()
    .min(1950, "El modelo debe ser mayor a 1950")
    .max(2026, "El modelo no puede ser mayor a el año actual +1"),
  colorMot: z
    .string()
    .min(1, "El color es requerido")
    .max(50, "El color no puede exceder 50 caracteres"),
  cilindrajeMot: z
    .number()
    .min(1, "El cilindraje debe ser mayor a 0"),
  documentoCliMot: z
    .string()
    .min(1, "El cliente es requerido"),
  codMarcaMot: z
    .number()
    .min(1, "La marca es requerida"),
});

interface MotoFormProps {
  moto?: Moto;
  isEdit?: boolean;
  clientes: any[];
  marcas: any[];
}

export default function MotoForm({
  moto,
  isEdit = false,
  clientes,
  marcas,
}: MotoFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placaMot: moto?.placaMot || "",
      modeloMot: moto?.modeloMot || new Date().getFullYear(),
      colorMot: moto?.colorMot || "",
      cilindrajeMot: moto?.cilindrajeMot || 0,
      documentoCliMot: "",
      codMarcaMot: 0,
    },
  });


  useEffect(() => {
    if (moto && isEdit) {
      form.reset({
        placaMot: moto.placaMot,
        modeloMot: moto.modeloMot,
        colorMot: moto.colorMot,
        cilindrajeMot: moto.cilindrajeMot,
        documentoCliMot: "",
        codMarcaMot: 0,
      });
    }
  }, [moto, form, isEdit]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      const resp = isEdit && moto
        ? await editarMoto(moto.placaMot, {
            modeloMot: values.modeloMot,
            colorMot: values.colorMot,
            cilindrajeMot: values.cilindrajeMot,
            documentoCliMot: values.documentoCliMot,
            codMarcaMot: values.codMarcaMot,
          })
        : await crearMoto(values as any);

      if (resp?.error) {
        setError(resp.error);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar moto" : "Crear moto"}
        subtitle={
          isEdit
            ? "Editar la información de la moto."
            : "Crear una nueva moto."
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="grid grid-cols-12 gap-4">
                {!isEdit && (
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="placaMot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ABC123"
                              type="text"
                              maxLength={6}
                              {...field}
                              onChange={(e) => {
                                // Solo permitir alfanuméricos
                                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                field.onChange(value);
                                // Validar en tiempo real cuando tenga 4, 5 o 6 caracteres
                                if (value.length >= 4 && value.length <= 6) {
                                  form.trigger("placaMot");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="modeloMot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo (Año)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2023"
                            type="number"
                            min="1950"
                            max="2026"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value ? parseInt(value) : 0);
                            }}
                            onKeyDown={(e) => {
                              // Prevenir entrada de -, +, e, E, .
                              if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="colorMot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rojo"
                            type="text"
                            {...field}
                            onChange={(e) => {
                              // Solo permitir letras, espacios y acentos
                              const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="cilindrajeMot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cilindraje (cc)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="250"
                            type="number"
                            min="1"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value ? parseInt(value) : 0);
                            }}
                            onKeyDown={(e) => {
                              // Prevenir entrada de -, +, e, E, .
                              if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="documentoCliMot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {clientes.length === 0 ? (
                                <SelectItem value="">No hay clientes disponibles</SelectItem>
                              ) : (
                                clientes.map((cliente: any) => (
                                  <SelectItem
                                    key={cliente.documentoCli}
                                    value={cliente.documentoCli}
                                  >
                                    {cliente.nombreCompleto}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="codMarcaMot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una marca" />
                            </SelectTrigger>
                            <SelectContent>
                              {marcas.length === 0 ? (
                                <SelectItem value="">No hay marcas disponibles</SelectItem>
                              ) : (
                                marcas.map((marca: any) => (
                                  <SelectItem
                                    key={marca.codMar}
                                    value={marca.codMar.toString()}
                                  >
                                    {marca.nombreMar}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-4 justify-end flex w-full gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </CardContent>
          </Card>
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-4 text-destructive">{error}</CardContent>
            </Card>
          )}
        </form>
      </Form>
    </>
  );
}
