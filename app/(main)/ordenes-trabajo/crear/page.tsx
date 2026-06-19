import OrdenForm from "../orden-form";
import {
  obtenerClientesSelect,
  obtenerProductosSelect,
  obtenerUsuariosAdmin,
  obtenerEstadosOt,
  obtenerMarcasSelect,
} from "../actions";

export default async function CrearOrdenPage() {
  const [clientes, productos, usuarios, estados, marcas] = await Promise.all([
    obtenerClientesSelect(),
    obtenerProductosSelect(),
    obtenerUsuariosAdmin(),
    obtenerEstadosOt(),
    obtenerMarcasSelect(),
  ]);

  return (
    <OrdenForm
      clientes={clientes}
      productos={productos}
      usuarios={usuarios}
      estados={estados}
      marcas={marcas}
    />
  );
}
