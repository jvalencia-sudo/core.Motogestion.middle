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
import { Cliente } from "@/lib/types/cliente";
import { Marca } from "@/lib/types/marca";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearMoto, editarMoto } from "./actions";

const formSchema = z.object({
  placaMot: z
    .string()
    .min(6, "La placa debe tener exactamente 6 caracteres")
    .max(6, "La placa debe tener exactamente 6 caracteres")
    .regex(/^[A-Z0-9]{6}$/, "La placa debe contener solo números y letras mayúsculas"),
  modeloMot: z
    .number()
    .min(1900, "El modelo debe ser mayor a 1900")
    .max(2100, "El modelo no puede ser mayor a 2100"),
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

interface MotoFormClientProps {
  moto?: Moto;
  isEdit?: boolean;
  clientes: Cliente[];
  marcas: Marca[];
}

export default function MotoFormClient({
  moto,
  isEdit = false,
  clientes,
  marcas,
}: MotoFormClientProps) {
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

  // Actualizar valores del formulario cuando cambia la moto
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
      } else {
        form.reset();
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
                              placeholder="ABC123 (6 caracteres)"
                              type="text"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
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
                            placeholder="Color de la moto"
                            type="text"
                            {...field}
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
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
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
                                    {cliente.nombreCompleto} ({cliente.documentoCli})
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
