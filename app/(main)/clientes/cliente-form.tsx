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
import { Cliente } from "@/lib/types/cliente";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearCliente, editarCliente } from "./actions";

const formSchema = z.object({
  documentoCli: z
    .string()
    .min(8, "El documento debe tener al menos 8 caracteres")
    .max(11, "El documento no puede exceder 11 caracteres")
    .regex(/^\d+$/, "El documento debe contener solo números"),
  nombreCli: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  apellido1Cli: z
    .string()
    .min(1, "El primer apellido es requerido")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  apellido2Cli: z
    .string()
    .max(50, "El apellido no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),
  telefonoCli: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos")
    .regex(/^\d+$/, "El teléfono debe contener solo números"),
  correoCli: z
    .string()
    .min(1, "El correo es requerido")
    .email("El correo debe ser válido"),
  direccionCli: z
    .string()
    .max(500, "La dirección no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

interface ClienteFormProps {
  cliente?: Cliente;
  isEdit?: boolean;
}

export default function ClienteForm({
  cliente,
  isEdit = false,
}: ClienteFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentoCli: cliente?.documentoCli || "",
      nombreCli: "",
      apellido1Cli: "",
      apellido2Cli: "",
      telefonoCli: cliente?.telefonoCli || "",
      correoCli: cliente?.correoCli || "",
      direccionCli: cliente?.direccionCli || "",
    },
  });

  useEffect(() => {
    if (cliente && isEdit) {
      const partes = cliente.nombreCompleto.split(" ");
      const nombre = partes[0] || "";
      const apellido1 = partes[1] || "";
      const apellido2 = partes.slice(2).join(" ") || "";

      form.reset({
        documentoCli: cliente.documentoCli,
        nombreCli: nombre,
        apellido1Cli: apellido1,
        apellido2Cli: apellido2,
        telefonoCli: cliente.telefonoCli,
        correoCli: cliente.correoCli,
        direccionCli: cliente.direccionCli,
      });
    }
  }, [cliente, form, isEdit]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      const resp = isEdit && cliente
        ? await editarCliente(cliente.documentoCli, {
            nombreCli: values.nombreCli,
            apellido1Cli: values.apellido1Cli,
            apellido2Cli: values.apellido2Cli || undefined,
            telefonoCli: values.telefonoCli,
            correoCli: values.correoCli,
            direccionCli: values.direccionCli || undefined,
          })
        : await crearCliente(values as any);

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
        title={isEdit ? "Editar cliente" : "Crear cliente"}
        subtitle={
          isEdit
            ? "Editar la información del cliente."
            : "Crear un nuevo cliente."
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
                      name="documentoCli"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Documento (8-11 dígitos)"
                              type="text"
                              maxLength={11}
                              {...field}
                              onChange={(e) => {
                                // Solo permitir números
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
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
                    name="nombreCli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre"
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
                    name="apellido1Cli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Apellido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Primer Apellido"
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
                    name="apellido2Cli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Apellido (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Segundo Apellido"
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
                    name="telefonoCli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Teléfono (10-15 dígitos)"
                            type="text"
                            maxLength={15}
                            {...field}
                            onChange={(e) => {
                              // Solo permitir números
                              const value = e.target.value.replace(/[^0-9]/g, '');
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
                    name="correoCli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="correo@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name="direccionCli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dirección del cliente"
                            type="text"
                            {...field}
                          />
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
