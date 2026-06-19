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
import { User, ChangePasswordRequest } from "@/lib/types/auth/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetearContrasena } from "../actions";
import { useRouter } from "next/navigation";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  user: User;
}

export default function ResetPasswordForm({ user }: ResetPasswordFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      const data: ChangePasswordRequest = {
        newPassword: values.newPassword,
      };

      const resp = await resetearContrasena(user.documentoUsu.toString(), data);

      if (resp?.error) {
        setError(resp.error);
      } else {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          router.push("/users");
        }, 2000);
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
        title="Resetear Contraseña"
        subtitle={`Cambiar la contraseña de ${user.nombreUsu} ${user.apellido1Usu}`}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Usuario:</strong> {user.nombreUsu} {user.apellido1Usu}{" "}
                  {user.apellido2Usu}
                </p>
                <p className="text-sm">
                  <strong>Documento:</strong> {user.documentoUsu}
                </p>
                <p className="text-sm">
                  <strong>Correo:</strong> {user.correoUsu}
                </p>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mínimo 8 caracteres"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Mínimo 8 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Confirma la contraseña"
                            type="password"
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/users")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Resetear Contraseña"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {success && (
            <Card className="border-green-500 bg-green-50">
              <CardContent className="pt-4 text-green-700">
                Contraseña actualizada exitosamente. Redirigiendo...
              </CardContent>
            </Card>
          )}

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
