import PerfilForm from "../perfil-form";
import { obtenerRoles } from "../actions";

export default async function CrearPerfilPage() {
  const rolesData = await obtenerRoles();

  return <PerfilForm roles={rolesData.data || []} isEdit={false} />;
}
