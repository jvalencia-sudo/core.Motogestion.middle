import ProductoForm from "@/app/(main)/productos/producto-form";
import { obtenerImpuestos } from "@/app/(main)/productos/actions";
import { appFetch } from "@/lib/fetch";
import { Producto } from "@/lib/types/producto";

export default async function CrearProductoPage() {
  const [productos, impuestos] = await Promise.all([
    appFetch<Producto[]>("/api/productos"),
    obtenerImpuestos(),
  ]);
  const disponibles = (productos.data || []).map((p) => ({
    codPro: p.codPro,
    nombrePro: p.nombrePro,
    tipoPro: p.tipoPro,
  }));

  return (
    <ProductoForm
      productosDisponibles={disponibles}
      impuestosDisponibles={impuestos}
    />
  );
}
