import { MessageCircle } from "lucide-react";

import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerResumen } from "./actions";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

const ESTADO_LABEL: Record<string, string> = {
  prueba: "Prueba",
  activo: "Activo",
  suspendido: "Suspendido",
};

function linkWhatsapp(telefono: string, nombreTal: string) {
  const soloDigitos = telefono.replace(/\D/g, "");
  const numero = soloDigitos.startsWith("57") ? soloDigitos : `57${soloDigitos}`;
  const texto = encodeURIComponent(
    `Hola, te escribo de MotoGestión por la suscripción de ${nombreTal}.`,
  );
  return `https://wa.me/${numero}?text=${texto}`;
}

export default async function ResumenSuperAdminPage() {
  const { data: resumen, error } = await obtenerResumen();

  if (error || !resumen) {
    return (
      <>
        <PageHeader title="Resumen" subtitle="Tablero de negocio de la plataforma." />
        <p className="text-sm text-destructive">No se pudo cargar el resumen.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Resumen" subtitle="Tablero de negocio de la plataforma." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingreso mensual recurrente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatoCOP(resumen.mrr)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Talleres ({resumen.totalTalleres})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(resumen.talleresPorEstado).map(([estado, total]) => (
              <Badge key={estado} variant="outline">
                {ESTADO_LABEL[estado] ?? estado}: {total}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cupos fundador restantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{resumen.cuposFundadorRestantes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversión prueba → pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {(resumen.conversionPruebaPago * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Vencimientos en los próximos 7 días</h2>
        {resumen.vencimientosProximos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay vencimientos próximos.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {resumen.vencimientosProximos.map((v) => (
              <Card key={v.codTaller}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{v.nombreTal}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.diasRestantes === 0
                        ? "Vence hoy"
                        : v.diasRestantes === 1
                          ? "Vence en 1 día"
                          : `Vence en ${v.diasRestantes} días`}
                    </p>
                  </div>
                  {v.telefonoTal && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={linkWhatsapp(v.telefonoTal, v.nombreTal)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-1 size-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
