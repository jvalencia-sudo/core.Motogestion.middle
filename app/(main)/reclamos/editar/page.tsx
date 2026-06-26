import { ReclamoForm } from "../reclamo-form";
import {
  obtenerReclamoPorId,
  obtenerOrdenesDisponibles,
} from "../actions";
import { notFound } from "next/navigation";

interface EditarReclamoPageProps {
  searchParams: Promise<{ codRec?: string }>;
}

export default async function EditarReclamoPage({
  searchParams,
}: EditarReclamoPageProps) {
  const params = await searchParams;
  const codRec = params.codRec ? parseInt(params.codRec) : null;

  if (!codRec) {
    notFound();
  }

  const [reclamo, ordenes] = await Promise.all([
    obtenerReclamoPorId(codRec),
    obtenerOrdenesDisponibles(),
  ]);

  if (!reclamo) {
    notFound();
  }

  return <ReclamoForm reclamo={reclamo} ordenes={ordenes} isEdit />;
}
