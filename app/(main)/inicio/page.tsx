import { appFetch } from "@/lib/fetch";
import { ResumenDashboard } from "@/lib/types/dashboard";

import { DashboardResumen } from "../dashboard-resumen";
import { TallerName } from "../taller-name";
import { BuscadorPlaca } from "./buscador-placa";

export default async function page() {
  const { data } = await appFetch<ResumenDashboard>("/api/dashboard/resumen");

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido a Moto.Gestión</h1>
        <TallerName />
        <p className="text-muted-foreground">Resumen de tu taller</p>
      </div>

      <BuscadorPlaca />

      <DashboardResumen resumen={data} />
    </div>
  );
}
