import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

import { appFetch } from "@/lib/fetch";
import { TallerSuscripcion } from "@/lib/types/taller";

// Banner de estado de suscripción. Se muestra solo en prueba (días restantes),
// prueba vencida o cuenta suspendida. En 'activo' no aparece.
export default async function SuscripcionBanner() {
  const { data } = await appFetch<TallerSuscripcion>("/api/talleres/suscripcion");
  if (!data) return null;

  if (data.estado === "suspendido") {
    return (
      <Bar tone="danger">
        <AlertTriangle className="size-4 shrink-0" />
        Tu cuenta está suspendida. Contacta a soporte para reactivarla.
      </Bar>
    );
  }

  if (data.vencido) {
    return (
      <Bar tone="danger">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Tu prueba gratis terminó. Activa un plan para seguir usando el sistema.</span>
        <Link href="/planes" className="ml-auto font-semibold underline">
          Ver planes
        </Link>
      </Bar>
    );
  }

  if (data.estado === "prueba" && data.diasRestantes !== null) {
    return (
      <Bar tone="warning">
        <Clock className="size-4 shrink-0" />
        <span>
          Estás en prueba gratis · te{" "}
          {data.diasRestantes === 1 ? "queda 1 día" : `quedan ${data.diasRestantes} días`}.
        </span>
        <Link href="/planes" className="ml-auto font-semibold underline">
          Ver planes
        </Link>
      </Bar>
    );
  }

  // El plan no se renueva solo (Wompi cobra una vez por checkout, no hay
  // suscripción recurrente): avisar unos días antes de que lo bloqueen a
  // mitad de jornada por no haber pagado de nuevo a tiempo.
  if (data.estado === "activo" && data.diasRestantes !== null && data.diasRestantes <= 5) {
    return (
      <Bar tone="warning">
        <Clock className="size-4 shrink-0" />
        <span>
          Tu plan vence{" "}
          {data.diasRestantes <= 0
            ? "hoy"
            : data.diasRestantes === 1
              ? "en 1 día"
              : `en ${data.diasRestantes} días`}{" "}
          · no se renueva solo, debes pagar de nuevo para seguir sin interrupciones.
        </span>
        <Link href="/planes" className="ml-auto font-semibold underline">
          Renovar
        </Link>
      </Bar>
    );
  }

  return null;
}

function Bar({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "warning" | "danger";
}) {
  const styles =
    tone === "danger"
      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
  return (
    <div
      className={`flex items-center gap-2 border-b px-4 py-2 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}
