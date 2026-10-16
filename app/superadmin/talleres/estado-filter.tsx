"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TODOS = "todos";

export function EstadoFilter({ estado }: { estado?: string }) {
  const router = useRouter();

  return (
    <Select
      value={estado ?? TODOS}
      onValueChange={(valor) => {
        router.push(valor === TODOS ? "/superadmin/talleres" : `/superadmin/talleres?estado=${valor}`);
      }}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>Todos los estados</SelectItem>
        <SelectItem value="prueba">Prueba</SelectItem>
        <SelectItem value="activo">Activo</SelectItem>
        <SelectItem value="suspendido">Suspendido</SelectItem>
      </SelectContent>
    </Select>
  );
}
