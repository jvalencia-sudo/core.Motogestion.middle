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
    nombreComercialTal: null,
    whatsappTal: null,
    colorPrincipalTal: "#00B06E",
    textoCondicionesTal: null,
    textoPieTal: null,
    mostrarPreciosUnitariosTal: true,
    mostrarMecanicoTal: true,
    mostrarFirmaClienteTal: false,
    mostrarDetallePublicoTal: true,
    horarioAtencionTal: null,
    exigirAprobacionCotizacionTal: false,
    nombreTal: "",
    nitTal: null,
    correoTal: null,
    tieneLogo: false,
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
