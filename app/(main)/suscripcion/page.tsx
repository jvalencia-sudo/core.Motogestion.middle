import { CalendarClock } from "lucide-react";

import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerHistorialPagos, obtenerSuscripcion } from "./actions";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

function formatoFecha(iso: string) {
  // "2026-10-15" o "2026-10-15 01:17" -> "15 oct 2026[, 01:17]"
  const [fecha, hora] = iso.split(" ");
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const texto = new Date(anio, mes - 1, dia).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return hora ? `${texto}, ${hora}` : texto;
}

const ESTADO_LABEL: Record<string, string> = {
  prueba: "Prueba gratis",
  activo: "Activo",
  suspendido: "Suspendido",
};

const PAGO_ESTADO: Record<
  string,
  { label: string; className: string }
> = {
  APPROVED: { label: "Aprobado", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" },
  DECLINED: { label: "Rechazado", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
  PENDING: { label: "Pendiente", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" },
};

export default async function SuscripcionPage() {
  const [suscripcion, pagos] = await Promise.all([
    obtenerSuscripcion(),
    obtenerHistorialPagos(),
  ]);

  return (
    <>
      <PageHeader
        title="Suscripción"
        subtitle="Estado de tu plan y el historial de pagos del taller."
      />

      {suscripcion && (
        <Card className="max-w-2xl">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plan actual</p>
                <p className="text-xl font-semibold">
                  {suscripcion.plan ?? "Prueba gratis"}
                </p>
              </div>
              <Badge
                variant={suscripcion.estado === "activo" ? "default" : "secondary"}
                className={
                  suscripcion.estado === "suspendido"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                    : ""
                }
              >
                {ESTADO_LABEL[suscripcion.estado] ?? suscripcion.estado}
              </Badge>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {suscripcion.precio != null && (
                <div>
                  <p className="text-muted-foreground">Precio mensual</p>
                  <p className="font-medium">{formatoCOP(suscripcion.precio)}</p>
                </div>
              )}
              {suscripcion.estado === "prueba" && suscripcion.diasRestantes !== null && (
                <div>
                  <p className="text-muted-foreground">Días restantes</p>
                  <p className="font-medium">
                    {suscripcion.vencido
                      ? "Prueba vencida"
                      : suscripcion.diasRestantes === 1
                        ? "1 día"
                        : `${suscripcion.diasRestantes} días`}
                  </p>
                </div>
              )}
              {suscripcion.fechaFin && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    {suscripcion.estado === "activo" ? "Próxima renovación" : "Vence"}
                  </p>
                  <p className="font-medium">{formatoFecha(suscripcion.fechaFin)}</p>
                </div>
              )}
              {suscripcion.miembroDesde && (
                <div>
                  <p className="text-muted-foreground">Miembro desde</p>
                  <p className="font-medium">{formatoFecha(suscripcion.miembroDesde)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Historial de pagos</h2>
        {pagos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay pagos registrados para este taller.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => {
                  const estado = PAGO_ESTADO[pago.estado] ?? {
                    label: pago.estado,
                    className: "",
                  };
                  return (
                    <TableRow key={pago.codPago}>
                      <TableCell>{formatoFecha(pago.fecha)}</TableCell>
                      <TableCell>{pago.nombrePlan}</TableCell>
                      <TableCell>{formatoCOP(pago.monto)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={estado.className}>
                          {estado.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
