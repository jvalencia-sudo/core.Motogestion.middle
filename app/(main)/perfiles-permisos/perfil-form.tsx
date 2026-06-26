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
import { Perfil } from "@/lib/types/auth/perfil";
import { Rol } from "@/lib/types/auth/rol";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearPerfil, editarPerfil } from "./actions";

const formSchema = z.object({
  nombrePrf: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcionPrf: z
    .string()
    .min(1, "La descripción es requerida")
    .max(255, "La descripción no puede exceder 255 caracteres"),
  codRolPrf: z.number().min(1, "Debe seleccionar un rol"),
  codEstPrf: z.number().optional(),
});

interface PageProps {
  perfil?: Perfil;
  roles: Rol[];
  isEdit?: boolean;
}

export default function PerfilForm({ perfil, roles, isEdit = false }: PageProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombrePrf: perfil?.nombrePrf || "",
      descripcionPrf: perfil?.descripcionPrf || "",
      codRolPrf: perfil?.codRolPrf || undefined,
      codEstPrf: perfil?.codEstPrf || 1,
    },
  });

  useEffect(() => {
    if (perfil) {
      form.reset({
        nombrePrf: perfil.nombrePrf,
        descripcionPrf: perfil.descripcionPrf,
        codRolPrf: perfil.codRolPrf,
        codEstPrf: perfil.codEstPrf,
      });
    }
  }, [perfil, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      const resp = isEdit && perfil
        ? await editarPerfil({
            codPrf: perfil.codPrf,
            nombrePrf: values.nombrePrf,
            descripcionPrf: values.descripcionPrf,
            codRolPrf: values.codRolPrf,
          })
        : await crearPerfil({
            nombrePrf: values.nombrePrf,
            descripcionPrf: values.descripcionPrf,
            codRolPrf: values.codRolPrf,
            codEstPrf: values.codEstPrf || 1,
          });

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
        title={isEdit ? "Editar perfil" : "Crear perfil"}
        subtitle={
          isEdit
            ? "Editar perfil existente."
            : "Crear un nuevo perfil de usuario."
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="nombrePrf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Perfil</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Administrador Principal"
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
                    name="codRolPrf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((rol) => (
                              <SelectItem
                                key={rol.codRol}
                                value={rol.codRol.toString()}
                              >
                                {rol.nombreRol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name="descripcionPrf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descripción del perfil"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!isEdit && (
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="codEstPrf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Activo</SelectItem>
                              <SelectItem value="2">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
              <CardContent className="pt-4 text-destructive">
                {error}
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </>
  );
}
