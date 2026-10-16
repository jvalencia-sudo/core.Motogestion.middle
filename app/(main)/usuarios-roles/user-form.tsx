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
import { Perfil } from "@/lib/types/auth/perfil";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crearUsuario, editarUsuario } from "./actions";
import { descripcionDeRol } from "./rol-descripcion";

// Un solo campo de rol (codPrfUsu): el backend deriva el rol global del
// perfil elegido, ya no se piden "rol" y "perfil" por separado (F0-13).
const createUserSchema = z.object({
  documentoUsu: z.string().min(1, "El documento es requerido"),
  nombreUsu: z.string().min(1, "El nombre es requerido"),
  apellido1Usu: z.string().min(1, "El primer apellido es requerido"),
  apellido2Usu: z.string().optional(),
  correoUsu: z.string().email("El correo debe ser válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  codPrfUsu: z.coerce.number().min(1, "El rol es requerido"),
  codTipoUsu: z.coerce.number().optional(),
  codEstUsu: z.coerce.number().optional(),
});

const updateUserSchema = z.object({
  documentoUsu: z.string().min(1, "El documento es requerido"),
  nombreUsu: z.string().min(1, "El nombre es requerido"),
  apellido1Usu: z.string().min(1, "El primer apellido es requerido"),
  apellido2Usu: z.string().optional(),
  correoUsu: z.string().email("El correo debe ser válido"),
  codPrfUsu: z.coerce.number().min(1, "El rol es requerido"),
  codTipoUsu: z.coerce.number().optional(),
  codEstUsu: z.coerce.number().optional(),
});

interface UserFormProps {
  user?: User;
  isEdit?: boolean;
  perfiles: Perfil[];
}

export default function UserForm({ user, isEdit = false, perfiles }: UserFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

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
      codTipoUsu: user?.codTipoUsu || 1,
      codEstUsu: user?.codEstUsu || 1,
    },
  });

  const selectedPerfil = form.watch("codPrfUsu");
  const rolSeleccionado = perfiles.find((p) => p.codPrf === selectedPerfil);
  // Perfiles propios del taller (F0-13 ext) tienen su propia descripción, mas
  // específica que el texto enlatado por cod_rol_prf -- se prefiere esa.
  const descripcion = rolSeleccionado?.descripcionPrf || descripcionDeRol(rolSeleccionado?.codRolPrf);

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    setLoading(true);
    setError(undefined);

    try {
      if (isEdit && user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...updateData } = values;
        const resp = await editarUsuario(
          user.documentoUsu.toString(),
          updateData as UpdateUserRequest
        );
        if (resp?.error) setError(resp.error);
      } else {
        const resp = await crearUsuario(values as CreateUserRequest);
        if (resp?.error) {
          setError(resp.error);
        } else {
          form.reset();
        }
      }
    } catch {
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

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="apellido1Usu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Apellido</FormLabel>
                        <FormControl>
                          <Input placeholder="Primer apellido" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="correoUsu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" type="email" {...field} />
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input placeholder="Mínimo 8 caracteres" type="password" {...field} />
                          </FormControl>
                          <FormDescription>Mínimo 8 caracteres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Un solo selector: el rol global se deriva de este perfil (F0-13) */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="codPrfUsu"
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
                            {perfiles.map((perfil) => (
                              <SelectItem key={perfil.codPrf} value={perfil.codPrf.toString()}>
                                {perfil.nombrePrf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {descripcion && (
                          <FormDescription>{descripcion}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
