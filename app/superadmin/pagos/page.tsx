import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { obtenerAlertasPagos, obtenerPagos } from "../actions";
import { columns } from "./columns";
import { FiltrosPagos } from "./filtros";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

export default async function PagosSuperAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; medio?: string }>;
}) {
  const { estado, medio } = await searchParams;
  const [{ data: pagos, error }, { data: alertas }] = await Promise.all([
    obtenerPagos(estado, medio),
    obtenerAlertasPagos(),
  ]);

  const hayAlertas =
    alertas &&
    (alertas.aprobadosSinSuscripcionActiva.length > 0 || alertas.pendientesViejos.length > 0);

  return (
    <>
      <PageHeader title="Pagos" subtitle="Pagos de todos los talleres (Wompi y manuales)." />

      {hayAlertas && (
        <div className="mb-6 flex flex-col gap-3">
          {alertas!.aprobadosSinSuscripcionActiva.length > 0 && (
            <Card className="border-amber-500/40">
              <CardContent className="flex items-start gap-2 p-4 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">Pagos aprobados sin suscripción activa</p>
                  <ul className="mt-1 list-disc pl-5">
                    {alertas!.aprobadosSinSuscripcionActiva.map((a) => (
                      <li key={a.codPago}>
                        <Link href={`/superadmin/talleres/${a.codTaller}`} className="hover:underline">
                          {a.nombreTal}
                        </Link>{" "}
                        · {formatoCOP(a.monto)} · {a.fecha}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          {alertas!.pendientesViejos.length > 0 && (
            <Card className="border-amber-500/40">
              <CardContent className="flex items-start gap-2 p-4 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">Pendientes hace más de un día</p>
                  <ul className="mt-1 list-disc pl-5">
                    {alertas!.pendientesViejos.map((a) => (
                      <li key={a.codPago}>
                        <Link href={`/superadmin/talleres/${a.codTaller}`} className="hover:underline">
                          {a.nombreTal}
                        </Link>{" "}
                        · {formatoCOP(a.monto)} · {a.fecha}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {error ? (
        <p className="text-sm text-destructive">No se pudieron cargar los pagos.</p>
      ) : (
        <DataTable
          columns={columns}
          data={pagos ?? []}
          extraActions={<FiltrosPagos estado={estado} medio={medio} />}
        />
      )}
    </>
  );
}
