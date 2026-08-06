import { notFound } from "next/navigation";
import ProductoForm from "@/app/(main)/productos/producto-form";
import { obtenerProductoPorCodigo, obtenerImpuestos } from "@/app/(main)/productos/actions";
import { appFetch } from "@/lib/fetch";
import { Producto } from "@/lib/types/producto";

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

  const [producto, productos, impuestos] = await Promise.all([
    obtenerProductoPorCodigo(parseInt(cod)),
    appFetch<Producto[]>("/api/productos"),
    obtenerImpuestos(),
  ]);

  if (!producto) {
    notFound();
  }

  const disponibles = (productos.data || []).map((p) => ({
    codPro: p.codPro,
    nombrePro: p.nombrePro,
    tipoPro: p.tipoPro,
  }));

  return (
    <ProductoForm
      producto={producto}
      isEdit={true}
      productosDisponibles={disponibles}
      impuestosDisponibles={impuestos}
    />
  );
}
