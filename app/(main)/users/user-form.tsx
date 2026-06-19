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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, CreateUserRequest, UpdateUserRequest } from "@/lib/types/auth/user";
import { Rol } from "@/lib/types/auth/rol";
import { Perfil } from "@/lib/types/auth/perfil";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearUsuario, editarUsuario } from "./actions";

// Schema para crear usuario
const createUserSchema = z.object({
  documentoUsu: z.string().min(1, "El documento es requerido"),
  nombreUsu: z.string().min(1, "El nombre es requerido"),
  apellido1Usu: z.string().min(1, "El primer apellido es requerido"),
  apellido2Usu: z.string().optional(),
  correoUsu: z.string().email("El correo debe ser válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  codPrfUsu: z.coerce.number().min(1, "El perfil es requerido"),
  codRolPrfUsu: z.coerce.number().min(1, "El rol es requerido"),
  codTipoUsu: z.coerce.number().optional(),
  codEstUsu: z.coerce.number().optional(),
});

// Schema para editar usuario (sin password obligatorio)
const updateUserSchema = z.object({
  documentoUsu: z.string().min(1, "El documento es requerido"),
  nombreUsu: z.string().min(1, "El nombre es requerido"),
  apellido1Usu: z.string().min(1, "El primer apellido es requerido"),
  apellido2Usu: z.string().optional(),
  correoUsu: z.string().email("El correo debe ser válido"),
  codPrfUsu: z.coerce.number().min(1, "El perfil es requerido"),
  codRolPrfUsu: z.coerce.number().min(1, "El rol es requerido"),
  codTipoUsu: z.coerce.number().optional(),
  codEstUsu: z.coerce.number().optional(),
});


interface UserFormProps {
  user?: User;
  isEdit?: boolean;
  roles: Rol[];
  perfiles: Perfil[];
}

export default function UserForm({ user, isEdit = false, roles, perfiles }: UserFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [perfilesFiltrados, setPerfilesFiltrados] = useState<Perfil[]>([]);

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      documentoUsu: user?.documentoUsu.toString() || "",
      nombreUsu: user?.nombreUsu || "",
      apellido1Usu: user?.apellido1Usu || "",
      apellido2Usu: user?.apellido2Usu || "",
      correoUsu: user?.correoUsu || "",
      password: "",
      codPrfUsu: user?.codPrfUsu,
      codRolPrfUsu: user?.codRolPrfUsu,
      codTipoUsu: user?.codTipoUsu || 1,
      codEstUsu: user?.codEstUsu || 1,
    },
  });

  // Watch para detectar cambios en el rol
  const selectedRol = form.watch("codRolPrfUsu");

  useEffect(() => {
    if (user) {
      form.reset({
        documentoUsu: user.documentoUsu.toString(),
        nombreUsu: user.nombreUsu,
        apellido1Usu: user.apellido1Usu,
        apellido2Usu: user.apellido2Usu || "",
        correoUsu: user.correoUsu || "",
        password: "",
        codPrfUsu: user.codPrfUsu,
        codRolPrfUsu: user.codRolPrfUsu,
        codTipoUsu: user.codTipoUsu,
        codEstUsu: user.codEstUsu,
      });
    }
  }, [user, form]);

  // Filtrar perfiles según el rol seleccionado
  useEffect(() => {
    if (selectedRol) {
      const perfilesPorRol = perfiles.filter(
        (perfil) => perfil.codRolPrf === selectedRol
      );
      setPerfilesFiltrados(perfilesPorRol);

      // Si el perfil actual no está en la lista filtrada, limpiar el campo
      const currentPerfil = form.getValues("codPrfUsu");
      if (currentPerfil && !perfilesPorRol.find(p => p.codPrf === currentPerfil)) {
        form.setValue("codPrfUsu", undefined);
      }
    } else {
      setPerfilesFiltrados([]);
      form.setValue("codPrfUsu", undefined);
    }
  }, [selectedRol, perfiles, form]);

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      if (isEdit && user) {
        // Para editar, no enviamos el password
        const { password, ...updateData } = values;
        const resp = await editarUsuario(
          user.documentoUsu.toString(),
          updateData as UpdateUserRequest
        );

        if (resp?.error) {
          setError(resp.error);
        }
      } else {
        // Para crear, enviamos todos los datos incluido password
        const resp = await crearUsuario(values as CreateUserRequest);

        if (resp?.error) {
          setError(resp.error);
        } else {
          form.reset();
        }
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
        title={isEdit ? "Editar usuario" : "Crear usuario"}
        subtitle={
          isEdit
            ? "Editar información del usuario existente."
            : "Crear un nuevo usuario en el sistema."
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Documento */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="documentoUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Documento de identidad"
                            type="text"
                            disabled={isEdit}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Nombre */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="nombreUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Primer Apellido */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="apellido1Usu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Apellido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Primer apellido"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Segundo Apellido */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="apellido2Usu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Apellido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Segundo apellido (opcional)"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Correo */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="correoUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="correo@ejemplo.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password - Solo en creación */}
                {!isEdit && (
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mínimo 8 caracteres"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Mínimo 8 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Rol */}
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="codRolPrfUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((rol) => (
                              <SelectItem key={rol.codRol} value={rol.codRol.toString()}>
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

                {/* Perfil */}
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="codPrfUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perfil</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={!selectedRol || perfilesFiltrados.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !selectedRol
                                  ? "Primero selecciona un rol"
                                  : perfilesFiltrados.length === 0
                                  ? "No hay perfiles para este rol"
                                  : "Selecciona un perfil"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {perfilesFiltrados.map((perfil) => (
                              <SelectItem key={perfil.codPrf} value={perfil.codPrf.toString()}>
                                {perfil.nombrePrf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Estado */}
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="codEstUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Activo</SelectItem>
                            <SelectItem value="0">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
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
