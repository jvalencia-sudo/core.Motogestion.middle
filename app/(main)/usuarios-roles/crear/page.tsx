import UserForm from "@/app/(main)/usuarios-roles/user-form";
import { obtenerPerfiles } from "@/app/(main)/usuarios-roles/actions";

export default async function CrearUsuarioPage() {
  const perfilesData = await obtenerPerfiles();

  return <UserForm perfiles={perfilesData.data || []} />;
}
