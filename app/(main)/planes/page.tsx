import { BadgeCheck } from "lucide-react";

import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerPlanes } from "./actions";
import SubscribeButton from "./subscribe-button";

const FEATURE_LABELS: Record<string, string> = {
  reportes: "Reportes descargables",
  multi_sucursal: "Multi-sucursal",
};

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

export default async function PlanesPage() {
  const planes = await obtenerPlanes();

  return (
    <>
      <PageHeader
        title="Planes"
        subtitle="Elige el plan que se ajuste a tu taller. La prueba es gratis por 30 días."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {planes.map((plan) => {
          const destacado = plan.nombrePlan === "Profesional";
          const gratis = plan.precioPlan <= 0;
          return (
            <Card
              key={plan.codPlan}
              className={destacado ? "relative border-primary ring-1 ring-primary" : ""}
            >
              {destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Recomendado
                </span>
              )}
              <CardContent className="flex flex-col gap-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold">{plan.nombrePlan}</h3>
                  <p className="text-3xl font-extrabold">
                    {gratis ? "Gratis" : formatoCOP(plan.precioPlan)}
                    {!gratis && <span className="text-sm font-normal text-muted-foreground"> /mes</span>}
                  </p>
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-green-500" />
                    {plan.maxUsuarios ? `Hasta ${plan.maxUsuarios} usuarios` : "Usuarios ilimitados"}
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-green-500" />
                    {plan.maxMotos ? `Hasta ${plan.maxMotos} motos` : "Motos ilimitadas"}
                  </li>
                  {Object.entries(plan.features || {})
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <li key={k} className="flex items-center gap-2">
                        <BadgeCheck className="size-4 text-green-500" />
                        {FEATURE_LABELS[k] ?? k}
                      </li>
                    ))}
                </ul>
                {gratis ? (
                  <p className="text-center text-sm text-muted-foreground">Tu plan de inicio</p>
                ) : (
                  <SubscribeButton plan={plan.nombrePlan} destacado={destacado} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
