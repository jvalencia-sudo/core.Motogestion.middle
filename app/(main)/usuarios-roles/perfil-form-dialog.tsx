"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PerfilDetallado } from "@/lib/types/auth/perfil";
import { crearPerfil, actualizarPerfil } from "./actions";

const NINGUNO = "ninguno";

const schema = z.object({
  nombrePrf: z.string().min(1, "El nombre es requerido"),
  descripcionPrf: z.string().min(1, "La descripción es requerida"),
  duplicarDe: z.string().optional(),
});

interface Props {
  perfil?: PerfilDetallado;
  perfilesExistentes: PerfilDetallado[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PerfilFormDialog({
  perfil,
  perfilesExistentes,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!perfil;
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      nombrePrf: perfil?.nombrePrf ?? "",
      descripcionPrf: perfil?.descripcionPrf ?? "",
      duplicarDe: NINGUNO,
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setGuardando(true);
    setError(undefined);

    const resp = isEdit
      ? await actualizarPerfil({
          codPrf: perfil!.codPrf,
          nombrePrf: values.nombrePrf,
          descripcionPrf: values.descripcionPrf,
        })
      : await crearPerfil({
          nombrePrf: values.nombrePrf,
          descripcionPrf: values.descripcionPrf,
          duplicarDe:
            values.duplicarDe && values.duplicarDe !== NINGUNO
              ? Number(values.duplicarDe)
              : undefined,
        });

    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    form.reset();
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Renombrar rol" : "Crear rol"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cambia el nombre y la descripción de este rol."
              : "Crea un rol propio del taller, desde cero o duplicando los permisos de otro."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nombrePrf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Practicante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcionPrf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Qué puede hacer este rol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && perfilesExistentes.length > 0 && (
              <FormField
                control={form.control}
                name="duplicarDe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duplicar permisos de</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NINGUNO}>Ninguno (empezar sin permisos)</SelectItem>
                        {perfilesExistentes.map((p) => (
                          <SelectItem key={p.codPrf} value={p.codPrf.toString()}>
                            {p.nombrePrf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
