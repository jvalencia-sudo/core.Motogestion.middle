import PageHeader from "@/components/page-header";
import { obtenerConfigTaller } from "./actions";
import ConfigForm from "./config-form";
import { TallerConfig } from "@/lib/types/taller";

export default async function ConfiguracionPage() {
  const config: TallerConfig =
    (await obtenerConfigTaller()) ?? { modoManoObra: "HORAS", tarifaHoraPred: 0 };

  return (
    <>
      <PageHeader
        title="Configuración"
        subtitle="Ajustes del taller: cómo se cobra la mano de obra."
      />
      <ConfigForm config={config} />
    </>
  );
}
