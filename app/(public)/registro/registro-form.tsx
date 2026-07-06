"use client";

import { useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { registrarTaller } from "./actions";

export function RegistroForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [correo, setCorreo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await registrarTaller({
      nombreTal: String(form.get("nombreTal") ?? "").trim(),
      nombreDueno: String(form.get("nombreDueno") ?? "").trim(),
      correo: String(form.get("correo") ?? "").trim(),
      nitTal: String(form.get("nitTal") ?? ""),
    });

    setLoading(false);
    if (res.ok) {
      setExito(true);
    } else {
      setError(res.error);
    }
  }

  if (exito) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            <BadgeCheck className="size-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Taller registrado!</h2>
          <p className="text-slate-400">
            Ya puedes ingresar al sistema con el correo{" "}
            <span className="font-medium text-white">{correo}</span>. Inicia
            sesión y empieza a gestionar tu taller.
          </p>
          <Button asChild size="lg" className="mt-2 bg-orange-500 text-white hover:bg-orange-600">
            <a href="/auth/login?returnTo=/inicio">Iniciar sesión</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombreTal">Nombre del taller</Label>
            <Input id="nombreTal" name="nombreTal" required placeholder="Ej. Moto Servicio JR" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nombreDueno">Tu nombre</Label>
            <Input id="nombreDueno" name="nombreDueno" required placeholder="Ej. Juan Pérez" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              Con este correo iniciarás sesión en el sistema.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nitTal">NIT (opcional)</Label>
            <Input id="nitTal" name="nitTal" placeholder="900000000-1" />
          </div>

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Registrando..." : "Registrar taller gratis"}
          </Button>

          <p className="text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/auth/login?returnTo=/inicio"
              className="font-medium text-orange-600 hover:underline"
            >
              Inicia sesión
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
