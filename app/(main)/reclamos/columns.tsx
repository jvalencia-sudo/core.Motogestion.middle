"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ReclamoResumen } from "@/lib/types/reclamo";
import { Badge } from "@/components/ui/badge";
import { ActionsCell } from "./actions-cell";

// Función para formatear fecha
const formatearFecha = (fecha: string) => {
  try {
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

// Función para obtener variante de badge según estado de garantía
const getGarantiaVariant = (estado: string) => {
  switch (estado) {
    case "VIGENTE":
      return "default";
    case "VENCIDA":
      return "destructive";
    default:
      return "secondary";
  }
};

export const columns: ColumnDef<ReclamoResumen>[] = [
  {
    accessorKey: "codRec",
    header: "ID",
    cell: ({ row }) => {
      const id = row.original.codRec;
      return <span className="font-mono font-semibold">#{id}</span>;
    },
  },
  {
    accessorKey: "descripcionRec",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.original.descripcionRec;
      return (
        <span className="max-w-xs truncate" title={descripcion}>
          {descripcion || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "consecutivoOtRec",
    header: "N° Orden",
    cell: ({ row }) => {
      const consecutivo = row.original.consecutivoOtRec;
      return (
        <span className="font-mono font-semibold">#{consecutivo}</span>
      );
    },
  },
  {
    accessorKey: "placaMot",
    header: "Placa",
    cell: ({ row }) => {
      const placa = row.original.placaMot;
      return (
        <span className="font-mono uppercase font-semibold">{placa || "-"}</span>
      );
    },
  },
  {
    accessorKey: "nombreCompletoCliente",
    header: "Cliente",
    cell: ({ row }) => {
      const nombre = row.original.nombreCompletoCliente;
      return (
        <span className="max-w-xs truncate" title={nombre}>
          {nombre || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "telefonoCli",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.original.telefonoCli;
      return <span className="font-mono">{telefono || "-"}</span>;
    },
  },
  {
    accessorKey: "estadoGarantia",
    header: "Garantía",
    cell: ({ row }) => {
      const estado = row.original.estadoGarantia;
      const variant = getGarantiaVariant(estado);

      return (
        <Badge variant={variant}>
          {estado || "Desconocido"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ActionsCell reclamo={row.original} />,
  },
];
