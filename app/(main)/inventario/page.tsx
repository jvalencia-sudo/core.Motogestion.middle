import { redirect } from "next/navigation";

// El inventario se unificó dentro de "Productos" (pestañas Catálogo / Movimientos /
// Entrada / Toma física). Se redirige para no dejar una vista duplicada.
export default function InventarioPage() {
  redirect("/productos");
}
