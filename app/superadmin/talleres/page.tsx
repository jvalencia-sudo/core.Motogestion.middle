import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { obtenerTalleres } from "../actions";
import { columns } from "./columns";
import { EstadoFilter } from "./estado-filter";

export default async function TalleresSuperAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const { data: talleres, error } = await obtenerTalleres(estado);

  return (
    <>
      <PageHeader title="Talleres" subtitle="Todos los talleres de la plataforma." />

      {error ? (
        <p className="text-sm text-destructive">No se pudieron cargar los talleres.</p>
      ) : (
        <DataTable
          columns={columns}
          data={talleres ?? []}
          extraActions={
            <div className="flex items-center gap-2">
              <EstadoFilter estado={estado} />
              <Button asChild size="sm">
                <Link href="/superadmin/talleres/crear">Crear taller</Link>
              </Button>
            </div>
          }
        />
      )}
    </>
  );
}
