"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearClienteFromModal } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface CreateClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteCreated: (documentoCli: string) => void;
}

export function CreateClienteDialog({
  open,
  onOpenChange,
  onClienteCreated,
}: CreateClienteDialogProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentoCli: "",
      nombreCli: "",
      apellido1Cli: "",
      apellido2Cli: "",
      telefonoCli: "",
      correoCli: "",
      direccionCli: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      const resp = await crearClienteFromModal(values as any);

      if (resp?.error) {
        setError(resp.error);
      } else {
        // Cliente creado exitosamente
        form.reset();
        onClienteCreated(values.documentoCli);
        onOpenChange(false);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al crear el cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Completa la información del nuevo cliente. Después de crearlo, podrás seleccionarlo automáticamente.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentoCli"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento *</FormLabel>
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

              <FormField
                control={form.control}
                name="nombreCli"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
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

              <FormField
                control={form.control}
                name="apellido1Cli"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primer Apellido *</FormLabel>
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

              <FormField
                control={form.control}
                name="telefonoCli"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
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

              <FormField
                control={form.control}
                name="correoCli"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo *</FormLabel>
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

              <FormField
                control={form.control}
                name="direccionCli"
                render={({ field }) => (
                  <FormItem className="col-span-2">
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setError(undefined);
                  onOpenChange(false);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
