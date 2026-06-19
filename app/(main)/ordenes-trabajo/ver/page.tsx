import { notFound } from "next/navigation";
import { obtenerOrdenTrabajo } from "../actions";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { GenerarPdfButton } from "./generar-pdf-button";

interface VerOrdenPageProps {
  searchParams: Promise<{ consecutivo?: string }>;
}

export default async function VerOrdenPage({ searchParams }: VerOrdenPageProps) {
  const params = await searchParams;
  const consecutivo = params.consecutivo
    ? parseInt(params.consecutivo)
    : null;

  if (!consecutivo) {
    notFound();
  }

  const orden = await obtenerOrdenTrabajo(consecutivo);

  if (!orden) {
    notFound();
  }

  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return "-";
    try {
      // Si la fecha viene en formato ISO (YYYY-MM-DD), parseamos manualmente
      if (fecha.includes('-')) {
        const [year, month, day] = fecha.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
      }
      return fecha;
    } catch {
      return fecha;
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <>
      <PageHeader
        title={`Orden de Trabajo #${orden.consecutivoOt}`}
        subtitle="Detalles de la orden de trabajo"
      />

      <div className="space-y-4">
        {/* Botones de acción */}
        <div className="flex gap-2">
          <Link href="/ordenes-trabajo">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Link href={`/ordenes-trabajo/editar?consecutivo=${orden.consecutivoOt}`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Orden
            </Button>
          </Link>
          {(orden.estadoOt === "En Proceso" || orden.estadoOt === "Completada") && (
            <GenerarPdfButton consecutivo={orden.consecutivoOt} />
          )}
          {orden.estadoOt === "Entregada" && (
            <GenerarPdfButton
              consecutivo={orden.consecutivoOt}
              tipo="factura"
              label="Generar Factura"
            />
          )}
        </div>

        {/* Card: Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Estado
                </p>
                <Badge
                  variant={
                    orden.estadoOt === "Pendiente"
                      ? "outline"
                      : orden.estadoOt === "En Proceso"
                      ? "default"
                      : orden.estadoOt === "Finalizada"
                      ? "default"
                      : "secondary"
                  }
                >
                  {orden.estadoOt || "Desconocido"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fecha de Elaboración
                </p>
                <p className="text-lg font-semibold">
                  {formatearFecha(orden.fechaElaboracionOt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fecha de Entrega
                </p>
                <p className="text-lg font-semibold">
                  {formatearFecha(orden.fechaEntregaOt)}
                </p>
              </div>
              {orden.fechaFinGarantiaOt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fin de Garantía
                  </p>
                  <p className="text-lg font-semibold">
                    {formatearFecha(orden.fechaFinGarantiaOt)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card: Información de la Moto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Moto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Placa</p>
                <p className="text-lg font-mono font-semibold uppercase">
                  {orden.placaMot}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marca/Modelo</p>
                <p className="text-lg font-semibold">
                  {orden.marcaMoto} {orden.modeloMot}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Color</p>
                <p className="text-lg font-semibold">{orden.colorMot}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cilindraje</p>
                <p className="text-lg font-semibold">{orden.cilindrajeMot} cc</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Kilometraje de Ingreso
                </p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat("es-CO").format(
                    orden.kilometrajeIngresoOt
                  )}{" "}
                  km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cliente
                </p>
                <p className="text-lg font-semibold">
                  {orden.nombreCompletoCliente}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Documento
                </p>
                <p className="text-lg font-semibold">
                  {orden.documentoCli}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teléfono
                </p>
                <p className="text-lg font-semibold">
                  {orden.telefonoCli}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Correo
                </p>
                <p className="text-lg font-semibold">
                  {orden.correoCli}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Personal Asignado */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recepcionista
                </p>
                <p className="text-lg font-semibold">
                  {orden.recepcionista}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mecánico Asignado
                </p>
                <p className="text-lg font-semibold">
                  {orden.mecanico}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Observación del Cliente
              </p>
              <p className="text-base mt-1">
                {orden.observacionCliOt || "Sin observaciones"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Observación del Taller
              </p>
              <p className="text-base mt-1">
                {orden.observacionOt || "Sin observaciones"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card: Productos y Servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Productos y Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            {orden.detalles && orden.detalles.length > 0 ? (
              <div className="space-y-3">
                {orden.detalles.map((detalle, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {detalle.nombrePro}
                      </p>
                      {detalle.descripcionPro && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {detalle.descripcionPro}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Confirmado por: {detalle.usuarioConfirmacion}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground">
                        {Math.abs(detalle.cantidadDeto)} x{" "}
                        {formatearMoneda(detalle.valorUnitarioDeto)}
                      </p>
                      <p className="font-semibold">
                        {formatearMoneda(Math.abs(detalle.cantidadDeto) * detalle.valorUnitarioDeto)}
                      </p>
                      {detalle.cantidadDeto < 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          No facturado
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t space-y-3">
                  {/* Subtotal (todos los productos) */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal:</span>
                    <span className="text-lg font-semibold">
                      {formatearMoneda(
                        orden.detalles.reduce((sum, det) => sum + (Math.abs(det.cantidadDeto) * det.valorUnitarioDeto), 0)
                      )}
                    </span>
                  </div>

                  {/* Mostrar productos no facturados si existen */}
                  {orden.detalles.some(d => d.cantidadDeto < 0) && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Productos no facturados:
                      </span>
                      <span className="text-green-600 font-medium">
                        -{formatearMoneda(
                          orden.detalles
                            .filter(d => d.cantidadDeto < 0)
                            .reduce((sum, det) => sum + (Math.abs(det.cantidadDeto) * det.valorUnitarioDeto), 0)
                        )}
                      </span>
                    </div>
                  )}

                  {/* Total a facturar */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <span className="text-lg font-semibold">Total a Facturar:</span>
                      <p className="text-xs text-muted-foreground">
                        {orden.totalItems || 0} producto{(orden.totalItems || 0) !== 1 ? 's' : ''} • Impuestos incluidos
                      </p>
                    </div>
                    <span className="text-2xl font-bold">
                      {formatearMoneda(orden.subtotalProductos || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay productos registrados en esta orden
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
