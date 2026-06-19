import { notFound } from "next/navigation";
import MarcaForm from "@/app/(main)/marcas/marca-form";
import { obtenerMarcaPorCodigo } from "@/app/(main)/marcas/actions";

type SearchParams = {
  cod?: string;
};

type EditarMarcaPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EditarMarcaPage({
  searchParams,
}: EditarMarcaPageProps) {
  const { cod } = await searchParams;

  if (!cod) {
    notFound();
  }

  const marca = await obtenerMarcaPorCodigo(parseInt(cod));

  if (!marca) {
    notFound();
  }

  return <MarcaForm marca={marca} isEdit={true} />;
}
