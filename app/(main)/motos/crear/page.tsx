import MotoForm from "@/app/(main)/motos/moto-form";
import { cargarDatosFormulario } from "@/app/(main)/motos/actions";

export default async function CrearMotoPage() {
  const { clientes, marcas } = await cargarDatosFormulario();

  return <MotoForm clientes={clientes} marcas={marcas} />;
}
