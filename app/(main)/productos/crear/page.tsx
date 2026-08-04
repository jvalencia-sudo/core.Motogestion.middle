import ProductoForm from "@/app/(main)/productos/producto-form";
import { appFetch } from "@/lib/fetch";
import { Producto } from "@/lib/types/producto";

export default async function CrearProductoPage() {
  const productos = await appFetch<Producto[]>("/api/productos");
  const disponibles = (productos.data || []).map((p) => ({
    codPro: p.codPro,
    nombrePro: p.nombrePro,
    tipoPro: p.tipoPro,
  }));

  return <ProductoForm productosDisponibles={disponibles} />;
}
