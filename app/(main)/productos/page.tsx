import { appFetch } from "@/lib/fetch";
import { Producto } from "@/lib/types/producto";
import ProductosView from "./productos-view";

export default async function ProductosPage() {
  const productosData = await appFetch<Producto[]>("/api/productos");

  return <ProductosView productos={productosData.data || []} />;
}
