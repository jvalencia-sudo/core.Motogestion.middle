import { notFound } from "next/navigation";
import MotoForm from "@/app/(main)/motos/moto-form";
import { obtenerMotoPorPlaca, cargarDatosFormulario } from "@/app/(main)/motos/actions";

type SearchParams = {
  placa?: string;
};

type EditarMotoPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EditarMotoPage({
  searchParams,
}: EditarMotoPageProps) {
  const { placa } = await searchParams;

  if (!placa) {
    notFound();
  }

  const [moto, { clientes, marcas }] = await Promise.all([
    obtenerMotoPorPlaca(placa),
    cargarDatosFormulario(),
  ]);

  if (!moto) {
    notFound();
  }

  return <MotoForm moto={moto} isEdit={true} clientes={clientes} marcas={marcas} />;
}
