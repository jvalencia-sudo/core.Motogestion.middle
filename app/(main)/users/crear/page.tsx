import UserForm from "@/app/(main)/users/user-form";
import { appFetch } from "@/lib/fetch";
import { Rol } from "@/lib/types/auth/rol";
import { Perfil } from "@/lib/types/auth/perfil";

async function loadRoles() {
  return await appFetch<Rol[]>("/api/rol");
}

async function loadPerfiles() {
  return await appFetch<Perfil[]>("/api/perfil");
}

export default async function CrearUsuarioPage() {
  const rolesData = await loadRoles();
  const perfilesData = await loadPerfiles();

  return (
    <UserForm
      roles={rolesData.data || []}
      perfiles={perfilesData.data || []}
    />
  );
}
