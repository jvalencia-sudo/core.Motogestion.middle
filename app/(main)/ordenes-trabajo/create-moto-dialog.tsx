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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearMotoFromModal } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface CreateMotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMotoCreated: (placaMot: string) => void;
  documentoCli: string;
  marcas: any[];
}

export function CreateMotoDialog({
  open,
  onOpenChange,
  onMotoCreated,
  documentoCli,
  marcas,
}: CreateMotoDialogProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placaMot: "",
      modeloMot: new Date().getFullYear(),
      colorMot: "",
      cilindrajeMot: 125,
      documentoCliMot: documentoCli,
      codMarcaMot: marcas.length > 0 ? marcas[0].codMar : 1,
    },
  });

  // Reset form cuando el modal se abre
  useEffect(() => {
    if (open) {
      form.reset({
        placaMot: "",
        modeloMot: new Date().getFullYear(),
        colorMot: "",
        cilindrajeMot: 125,
        documentoCliMot: documentoCli,
        codMarcaMot: marcas.length > 0 ? marcas[0].codMar : 1,
      });
      setError(undefined);
    }
  }, [open, documentoCli, marcas, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      const resp = await crearMotoFromModal(values as any);

      if (resp?.error) {
        setError(resp.error);
      } else {
        // Moto creada exitosamente
        form.reset();
        onMotoCreated(values.placaMot);
        onOpenChange(false);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al crear la moto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Moto</DialogTitle>
          <DialogDescription>
            Completa la información de la nueva moto para el cliente seleccionado.
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
                name="placaMot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa *</FormLabel>
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

              <FormField
                control={form.control}
                name="modeloMot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo (Año) *</FormLabel>
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

              <FormField
                control={form.control}
                name="colorMot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color *</FormLabel>
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

              <FormField
                control={form.control}
                name="cilindrajeMot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cilindraje (cc) *</FormLabel>
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

              <FormField
                control={form.control}
                name="codMarcaMot"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Marca *</FormLabel>
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
                            <SelectItem value="0">No hay marcas disponibles</SelectItem>
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
                {loading ? "Creando..." : "Crear Moto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
