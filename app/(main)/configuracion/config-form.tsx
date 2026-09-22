"use client";

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
import { tallerConfigSchema, TallerConfigFormData } from "@/lib/schemas/taller";
import { TallerConfig } from "@/lib/types/taller";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { guardarConfigTaller } from "./actions";

const MODOS = [
  { value: "HORAS", label: "Por horas (tarifa fija)", hint: "Se cobra horas × tarifa por hora." },
  { value: "LIBRE", label: "Valor libre", hint: "El valor de la mano de obra se define en cada orden." },
] as const;

export default function ConfigForm({ config }: { config: TallerConfig }) {
  const [error, setError] = useState<string>();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<TallerConfigFormData>({
    resolver: zodResolver(tallerConfigSchema),
    defaultValues: {
      modoManoObra: config.modoManoObra,
      tarifaHoraPred: config.tarifaHoraPred,
    },
  });

  const modo = useWatch({ control: form.control, name: "modoManoObra", defaultValue: config.modoManoObra });

  async function onSubmit(values: TallerConfigFormData) {
    setLoading(true);
    setError(undefined);
    setOk(false);
    try {
      const resp = await guardarConfigTaller(values);
      if (resp.error) setError(resp.error);
      else setOk(true);
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Mano de obra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="modoManoObra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de cobro *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el modo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODOS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {MODOS.find((m) => m.value === field.value)?.hint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {modo === "HORAS" && (
                <FormField
                  control={form.control}
                  name="tarifaHoraPred"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa por hora (COP) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor por hora usado por defecto al agregar mano de obra.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        {ok && (
          <Card className="border-primary mt-4">
            <CardContent className="pt-4 text-primary">
              Configuración guardada correctamente.
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="border-destructive mt-4">
            <CardContent className="pt-4 text-destructive">{error}</CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
