"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createReclamoSchema,
  updateReclamoSchema,
  type CreateReclamoFormData,
  type UpdateReclamoFormData,
} from "@/lib/schemas/reclamo";
import {
  ReclamoDetalle,
  OrdenTrabajoPara,
} from "@/lib/types/reclamo";
import { crearReclamo, editarReclamo } from "./actions";

interface ReclamoFormProps {
  reclamo?: ReclamoDetalle;
  ordenes: OrdenTrabajoPara[];
  isEdit?: boolean;
}

export function ReclamoForm({
  reclamo,
  ordenes,
  isEdit = false,
}: ReclamoFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [openOrdenCombobox, setOpenOrdenCombobox] = useState(false);

  const schema = isEdit ? updateReclamoSchema : createReclamoSchema;
  const form = useForm<CreateReclamoFormData | UpdateReclamoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descripcionRec: reclamo?.descripcionRec || "",
      ...(isEdit ? {} : { consecutivoOtRec: undefined }),
      ...(isEdit
        ? {}
        : {
            consecutivoOtRec: reclamo?.consecutivoOtRec || undefined,
          }),
    },
  });

  const ordenSeleccionada = form.getValues("consecutivoOtRec");
  const ordenInfo = ordenes?.find((o) => o.consecutivoOt === ordenSeleccionada);

  async function onSubmit(data: CreateReclamoFormData | UpdateReclamoFormData) {
    setError(undefined);
    setLoading(true);

    try {
      if (isEdit && reclamo) {
        const resp = await editarReclamo(reclamo.codRec, data);
        if (resp?.error) {
          setError(resp.message || "Error al actualizar el reclamo");
          setLoading(false);
          return;
        }
        router.push("/reclamos");
      } else {
        const resp = await crearReclamo(data as CreateReclamoFormData);
        if (resp?.error) {
          setError(resp.message || "Error al crear el reclamo");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error en onSubmit:", err);
      setError("Ocurrió un error inesperado");
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar Reclamo" : "Nuevo Reclamo"}
        subtitle={
          isEdit
            ? "Actualiza la información del reclamo"
            : "Crea un nuevo reclamo para una orden de trabajo completada"
        }
      />

      <div className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="consecutivoOtRec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden de Trabajo *</FormLabel>
                      <Popover open={openOrdenCombobox} onOpenChange={setOpenOrdenCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openOrdenCombobox}
                            className="w-full justify-between"
                            disabled={loading}
                          >
                            {ordenSeleccionada
                              ? ordenes?.find((o) => o.consecutivoOt === ordenSeleccionada)
                                  ? `#${ordenSeleccionada} - ${
                                      ordenes.find((o) => o.consecutivoOt === ordenSeleccionada)
                                        ?.placaMot
                                    } - ${
                                      ordenes.find((o) => o.consecutivoOt === ordenSeleccionada)
                                        ?.nombreCompletoCliente
                                    }`
                                  : "Selecciona una orden de trabajo"
                              : "Selecciona una orden de trabajo"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar por N° orden, placa o cliente..." />
                            <CommandList>
                              <CommandEmpty>No se encontró ninguna orden.</CommandEmpty>
                              <CommandGroup>
                                {ordenes?.map((orden) => (
                                  <CommandItem
                                    key={orden.consecutivoOt}
                                    value={`${orden.consecutivoOt} ${orden.placaMot} ${orden.nombreCompletoCliente}`}
                                    onSelect={() => {
                                      form.setValue("consecutivoOtRec", orden.consecutivoOt);
                                      setOpenOrdenCombobox(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        ordenSeleccionada === orden.consecutivoOt
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="font-mono font-semibold">
                                      #{orden.consecutivoOt}
                                    </span>
                                    <span className="ml-2 font-mono text-sm text-muted-foreground">
                                      {orden.placaMot.toUpperCase()}
                                    </span>
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      {orden.nombreCompletoCliente}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Selecciona la orden de trabajo para la cual deseas crear el reclamo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isEdit && ordenInfo && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-3">Información de la Orden</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">N° Orden:</span>
                      <p className="font-mono font-semibold">#{ordenInfo.consecutivoOt}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Placa:</span>
                      <p className="font-mono uppercase">{ordenInfo.placaMot}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <p>{ordenInfo.nombreCompletoCliente}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha de Elaboración:</span>
                      <p className="font-semibold">{ordenInfo.fechaElaboracionOt}</p>
                    </div>
                  </div>
                </div>
              )}

              {isEdit && reclamo && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-medium mb-3">Información de la Orden</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">N° Orden:</span>
                      <p className="font-mono font-semibold">
                        #{reclamo.consecutivoOtRec}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Moto:</span>
                      <p className="font-mono uppercase">
                        {reclamo.placaMot}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cliente:</span>
                      <p>{reclamo.nombreCompletoCliente}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Garantía:</span>
                      <p className="font-semibold">
                        {reclamo.estadoGarantia}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="descripcionRec"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Reclamo *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el problema o reclamo encontrado después de entregar la orden de trabajo"
                        className="min-h-[120px] resize-none"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Mínimo 5 caracteres, máximo 500 caracteres (
                      {field.value?.length || 0}/500)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Actualizar" : "Crear"} Reclamo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/reclamos")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
