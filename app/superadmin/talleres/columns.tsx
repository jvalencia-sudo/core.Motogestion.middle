"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { TallerPlataforma } from "@/lib/types/superadmin/taller";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

const ESTADO_BADGE: Record<string, string> = {
  prueba: "",
  activo: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  suspendido: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
};

export const columns: ColumnDef<TallerPlataforma>[] = [
  {
    accessorKey: "nombreTal",
    header: "Taller",
    cell: ({ row }) => (
      <Link href={`/superadmin/talleres/${row.original.codTaller}`} className="font-medium hover:underline">
        {row.original.nombreTal}
      </Link>
    ),
  },
  {
    accessorKey: "estadoTal",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant="outline" className={ESTADO_BADGE[row.original.estadoTal] ?? ""}>
        {row.original.estadoTal}
      </Badge>
    ),
  },
  {
    accessorKey: "diasRestantes",
    header: "Días restantes",
    cell: ({ row }) => row.original.diasRestantes ?? "-",
  },
  {
    accessorKey: "precioSuscTal",
    header: "Precio pactado",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1">
        {row.original.precioSuscTal != null ? formatoCOP(row.original.precioSuscTal) : "-"}
        {row.original.esFundador && <Badge variant="secondary">Fundador</Badge>}
      </span>
    ),
  },
  {
    accessorKey: "ultimoPagoFecha",
    header: "Último pago",
    cell: ({ row }) => row.original.ultimoPagoFecha ?? "-",
  },
  {
    accessorKey: "ordenesUltimos7Dias",
    header: "Órdenes 7d",
  },
  {
    accessorKey: "ordenesUltimos30Dias",
    header: "Órdenes 30d",
  },
  {
    accessorKey: "usuariosActivos",
    header: "Usuarios activos",
  },
  {
    accessorKey: "ultimaActividad",
    header: "Última actividad",
    cell: ({ row }) => row.original.ultimaActividad ?? "-",
  },
];
