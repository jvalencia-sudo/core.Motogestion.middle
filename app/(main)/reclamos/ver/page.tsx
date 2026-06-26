import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { obtenerReclamoPorId } from "../actions";
import { notFound } from "next/navigation";

interface VerReclamoPageProps {
  searchParams: Promise<{ codRec?: string }>;
}

export default async function VerReclamoPage({
  searchParams,
}: VerReclamoPageProps) {
  const params = await searchParams;
  const codRec = params.codRec ? parseInt(params.codRec) : null;

  if (!codRec) {
    notFound();
  }

  const reclamo = await obtenerReclamoPorId(codRec);

  if (!reclamo) {
    notFound();
  }

  const formatearFecha = (fecha: string) => {
    try {
      if (fecha.includes("-")) {
        const [year, month, day] = fecha.split("-");
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

  const getGarantiaColor = (estado: string) => {
    switch (estado) {
      case "VIGENTE":
        return "default";
      case "VENCIDA":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title={`Reclamo #${reclamo.codRec}`}
          subtitle="Detalles completos del reclamo registrado"
        />
        <div className="flex gap-2">
          <Link href="/reclamos">
            <Button size="sm" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Link href={`/reclamos/editar?codRec=${reclamo.codRec}`}>
            <Button size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-semibold">Información del Reclamo</h2>
            <Badge variant={getGarantiaColor(reclamo.estadoGarantia)}>
              {reclamo.estadoGarantia}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-3">
                {reclamo.descripcionRec}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-semibold">
              Información de la Orden de Trabajo
            </h2>
            {reclamo.estadoGarantia === "VIGENTE" && (
              <Link href={`/ordenes-trabajo/crear?placaMot=${encodeURIComponent(reclamo.placaMot || "")}`}>
                <Button size="sm" variant="outline">
                  + Crear Nueva Orden
                </Button>
              </Link>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-600">
                N° Orden
              </label>
              <p className="mt-1 font-mono text-lg font-semibold">
                #{reclamo.consecutivoOtRec}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Placa de Moto
              </label>
              <p className="mt-1 font-mono uppercase font-semibold">
                {reclamo.placaMot}
              </p>
            </div>
            {reclamo.fechaFinGarantiaOt && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Fecha Fin de Garantía
                </label>
                <p className="mt-1 font-mono text-lg font-semibold">
                  {formatearFecha(reclamo.fechaFinGarantiaOt)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-6 border-b pb-4 text-lg font-semibold">
            Información del Cliente
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Nombre
              </label>
              <p className="mt-1">{reclamo.nombreCompletoCliente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Teléfono
              </label>
              <p className="mt-1 font-mono">{reclamo.telefonoCli}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
