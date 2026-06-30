import { ReclamoForm } from "../reclamo-form";
import { obtenerOrdenesDisponibles } from "../actions";

export default async function CrearReclamoPage() {
  const ordenes = await obtenerOrdenesDisponibles();

  return (
    <ReclamoForm ordenes={ordenes} />
  );
}
