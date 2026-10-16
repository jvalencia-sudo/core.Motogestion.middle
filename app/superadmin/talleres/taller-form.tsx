"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { crearTallerManual } from "../actions";

const schema = z.object({
  nombreTal: z.string().min(1, "El nombre del taller es requerido"),
  correo: z.string().email("El correo debe ser válido"),
  nombreDueno: z.string().min(1, "El nombre del dueño es requerido"),
  nitTal: z.string().optional(),
});

export default function TallerForm() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [creado, setCreado] = useState<{ nombreTal: string; correo: string }>();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nombreTal: "", correo: "", nombreDueno: "", nitTal: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    setError(undefined);
    const resp = await crearTallerManual(values);
    setLoading(false);
    if (resp.error || !resp.data) {
      setError(resp.error);
      return;
    }
    setCreado({ nombreTal: resp.data.nombreTal, correo: resp.data.correo });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="max-w-xl">
          <CardContent className="flex flex-col gap-4 py-4">
            <FormField
              control={form.control}
              name="nombreTal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del taller</FormLabel>
                  <FormControl>
                    <Input placeholder="Taller El Rápido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombreDueno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del dueño</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="correo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo del dueño</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nitTal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIT (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="900000000-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear taller"}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {creado && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Taller &quot;{creado.nombreTal}&quot; creado. El dueño recibirá una
                invitación por correo en {creado.correo}.
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
