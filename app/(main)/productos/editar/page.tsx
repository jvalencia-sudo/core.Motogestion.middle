import { notFound } from "next/navigation";
import ProductoForm from "@/app/(main)/productos/producto-form";
import { obtenerProductoPorCodigo } from "@/app/(main)/productos/actions";

type SearchParams = {
  cod?: string;
};

type EditarProductoPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EditarProductoPage({
  searchParams,
}: EditarProductoPageProps) {
  const { cod } = await searchParams;

  if (!cod) {
    notFound();
  }

  const producto = await obtenerProductoPorCodigo(parseInt(cod));

  if (!producto) {
    notFound();
  }

  return <ProductoForm producto={producto} isEdit={true} />;
}
