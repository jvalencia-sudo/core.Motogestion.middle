"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PagoPlataforma } from "@/lib/types/superadmin/pago";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

const ESTADO_BADGE: Record<string, string> = {
  APPROVED: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  DECLINED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

export const columns: ColumnDef<PagoPlataforma>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "nombreTal",
    header: "Taller",
    cell: ({ row }) => (
      <Link href={`/superadmin/talleres/${row.original.codTaller}`} className="hover:underline">
        {row.original.nombreTal}
      </Link>
    ),
  },
  {
    accessorKey: "nombrePlan",
    header: "Plan",
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => formatoCOP(row.original.monto),
  },
  {
    accessorKey: "medio",
    header: "Medio",
    cell: ({ row }) => (
      <span>
        {row.original.medio}
        {row.original.detalleMedio ? ` (${row.original.detalleMedio})` : ""}
      </span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant="outline" className={ESTADO_BADGE[row.original.estado] ?? ""}>
        {row.original.estado}
      </Badge>
    ),
  },
];
