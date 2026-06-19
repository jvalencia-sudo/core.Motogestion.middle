"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Producto } from "@/lib/types/producto";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, XCircle, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ActionsCell } from "./actions-cell";
import { ImpuestosCell } from "./impuestos-cell";

// Función para calcular precio con impuestos
const calcularPrecioConImpuestos = (producto: Producto): number => {
  const subtotal = producto.precioPro;
  const totalImpuestos = producto.impuestos.reduce((sum, imp) => {
    return sum + (subtotal * imp.porcentaje / 100);
  }, 0);
  return subtotal + totalImpuestos;
};

export const columns: ColumnDef<Producto>[] = [
  {
    accessorKey: "codPro",
    header: "Código",
  },
  {
    accessorKey: "nombrePro",
    header: "Nombre",
  },
  {
    accessorKey: "descripcionPro",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.original.descripcionPro;
      return descripcion || "-";
    },
  },
  {
    accessorKey: "precioPro",
    header: "Precio Base",
    cell: ({ row }) => {
      const precio = row.original.precioPro;
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(precio);
    },
  },
  {
    id: "precio_con_impuestos",
    header: "Precio + Impuestos",
    cell: ({ row }) => {
      const producto = row.original;
      const precioFinal = calcularPrecioConImpuestos(producto);
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(precioFinal);
    },
  },
  {
    id: "impuestos",
    header: "Impuestos",
    cell: ({ row }) => <ImpuestosCell impuestos={row.original.impuestos} />,
  },
  {
    accessorKey: "stockPro",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stockPro;
      const stockMin = row.original.stockProMin;
      const variant = stock === 0 ? "destructive" : stock <= stockMin ? "outline" : "default";
      return (
        <Badge variant={variant}>
          {stock} / {stockMin} mín
        </Badge>
      );
    },
  },
  {
    accessorKey: "estadoProducto",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estadoProducto;
      return (
        <Badge variant={estado === "Activo" ? "default" : "destructive"}>
          {estado}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ActionsCell producto={row.original} />,
  },
];
