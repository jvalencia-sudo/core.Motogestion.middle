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

function construirUrl(estado: string, medio: string) {
  const params = new URLSearchParams();
  if (estado !== TODOS) params.set("estado", estado);
  if (medio !== TODOS) params.set("medio", medio);
  const query = params.toString();
  return query ? `/superadmin/pagos?${query}` : "/superadmin/pagos";
}

export function FiltrosPagos({ estado, medio }: { estado?: string; medio?: string }) {
  const router = useRouter();
  const estadoActual = estado ?? TODOS;
  const medioActual = medio ?? TODOS;

  return (
    <div className="flex gap-2">
      <Select
        value={estadoActual}
        onValueChange={(valor) => router.push(construirUrl(valor, medioActual))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los estados</SelectItem>
          <SelectItem value="APPROVED">Aprobado</SelectItem>
          <SelectItem value="PENDING">Pendiente</SelectItem>
          <SelectItem value="DECLINED">Rechazado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={medioActual}
        onValueChange={(valor) => router.push(construirUrl(estadoActual, valor))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Medio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los medios</SelectItem>
          <SelectItem value="WOMPI">Wompi</SelectItem>
          <SelectItem value="MANUAL">Manual</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
