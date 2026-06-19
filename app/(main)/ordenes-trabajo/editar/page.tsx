import { notFound } from "next/navigation";
import OrdenForm from "../orden-form";
import {
  obtenerOrdenTrabajo,
  obtenerProductosSelect,
  obtenerUsuariosAdmin,
  obtenerEstadosOt,
  obtenerClientesSelect,
  obtenerMarcasSelect,
} from "../actions";

interface EditarOrdenPageProps {
  searchParams: Promise<{ consecutivo?: string }>;
}

export default async function EditarOrdenPage({
  searchParams,
}: EditarOrdenPageProps) {
  const params = await searchParams;
  const consecutivo = params.consecutivo
    ? parseInt(params.consecutivo)
    : null;

  if (!consecutivo) {
    notFound();
  }

  const [orden, clientes, productos, usuarios, estados, marcas] = await Promise.all([
    obtenerOrdenTrabajo(consecutivo),
    obtenerClientesSelect(),
    obtenerProductosSelect(),
    obtenerUsuariosAdmin(),
    obtenerEstadosOt(),
    obtenerMarcasSelect(),
  ]);

  if (!orden) {
    notFound();
  }

  return (
    <OrdenForm
      orden={orden}
      clientes={clientes}
      productos={productos}
      usuarios={usuarios}
      estados={estados}
      marcas={marcas}
      isEdit
    />
  );
}
