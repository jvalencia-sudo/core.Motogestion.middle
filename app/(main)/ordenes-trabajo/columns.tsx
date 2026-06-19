"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrdenTrabajoResumen } from "@/lib/types/ordenTrabajo";
import { Badge } from "@/components/ui/badge";
import { ActionsCell } from "./actions-cell";

// Función para formatear fecha sin dependencias
const formatearFecha = (fecha: string) => {
  try {
    // Si la fecha viene en formato ISO (YYYY-MM-DD), parseamos manualmente
    // para evitar problemas de zona horaria
    if (fecha.includes('-')) {
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    }

    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fecha;
  }
};

export const columns: ColumnDef<OrdenTrabajoResumen>[] = [
  {
    accessorKey: "consecutivoOt",
    header: "N° Orden",
    cell: ({ row }) => {
      const consecutivo = row.original.consecutivoOt;
      return <span className="font-mono font-semibold">#{consecutivo}</span>;
    },
  },
  {
    accessorKey: "fechaElaboracionOt",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fechaElaboracionOt;
      return formatearFecha(fecha);
    },
  },
  {
    accessorKey: "placaMot",
    header: "Placa",
    cell: ({ row }) => {
      const placa = row.original.placaMot;
      return <span className="font-mono uppercase font-semibold">{placa}</span>;
    },
  },
  {
    accessorKey: "nombreCompletoCliente",
    header: "Cliente",
    cell: ({ row }) => {
      const nombre = row.original.nombreCompletoCliente;
      return nombre || "-";
    },
  },
  {
    accessorKey: "telefonoCli",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.original.telefonoCli;
      return telefono || "-";
    },
  },
  {
    accessorKey: "mecanico",
    header: "Mecánico",
    cell: ({ row }) => {
      const mecanico = row.original.mecanico;
      return mecanico || "-";
    },
  },
  {
    accessorKey: "estadoOt",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estadoOt;

      // Estados: 1=Pendiente, 2=En Proceso, 3=Finalizada, 4=Entregada
      const variant =
        estado === "Pendiente" ? "outline" :
        estado === "En Proceso" ? "default" :
        estado === "Finalizada" ? "default" :
        estado === "Entregada" ? "secondary" :
        "destructive";

      return (
        <Badge variant={variant}>
          {estado || "Desconocido"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalOt",
    header: "Total",
    cell: ({ row }) => {
      // Usamos subtotalProductos si está disponible (incluye impuestos)
      // Si no, usamos totalOt como fallback
      const total = row.original.subtotalProductos || row.original.totalOt || 0;
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(total);
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ActionsCell orden={row.original} />,
  },
];
