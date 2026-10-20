"use client";

import { useMemo, useState } from "react";
import { CirclePlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OrdenTrabajoResumen } from "@/lib/types/ordenTrabajo";
import { columns } from "./columns";

interface OrdenesTableProps {
  ordenes: OrdenTrabajoResumen[];
}

/**
 * F1-07: envuelve el DataTable (ya filtra/ordena solo del lado del cliente)
 * para agregar el filtro "con saldo pendiente" -- no necesita ida al backend,
 * las órdenes ya vienen todas con su saldoOt calculado.
 */
export function OrdenesTable({ ordenes }: OrdenesTableProps) {
  const [soloConSaldo, setSoloConSaldo] = useState(false);

  const data = useMemo(
    () => (soloConSaldo ? ordenes.filter((o) => (o.saldoOt || 0) > 0) : ordenes),
    [ordenes, soloConSaldo]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      extraActions={
        <>
          <div className="flex items-center gap-2">
            <Switch
              id="solo-con-saldo"
              checked={soloConSaldo}
              onCheckedChange={setSoloConSaldo}
            />
            <Label htmlFor="solo-con-saldo" className="whitespace-nowrap">
              Con saldo pendiente
            </Label>
          </div>
          <Link href="/ordenes-trabajo/crear">
            <Button className="h-8">
              <CirclePlusIcon className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </Link>
        </>
      }
    />
  );
}
