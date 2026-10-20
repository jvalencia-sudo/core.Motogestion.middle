import PageHeader from "@/components/page-header";
import { obtenerConfigTaller } from "./actions";
import ConfigForm from "./config-form";
import { TallerConfig } from "@/lib/types/taller";

export default async function MiTallerPage() {
  const config: TallerConfig = (await obtenerConfigTaller()) ?? {
    modoManoObra: "HORAS",
    tarifaHoraPred: 0,
    telefonoTal: null,
    direccionTal: null,
    textoPieComprobante: null,
    nombreTal: "",
    nitTal: null,
    correoTal: null,
  };

  return (
    <>
      <PageHeader
        title="Mi taller"
        subtitle="Parámetros y resumen general de tu taller."
      />
      <ConfigForm config={config} />
    </>
  );
}
