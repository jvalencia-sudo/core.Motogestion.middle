import { notFound } from "next/navigation";
import UserForm from "@/app/(main)/users/user-form";
import { obtenerUsuarioPorDocumento } from "@/app/(main)/users/actions";
import { appFetch } from "@/lib/fetch";
import { Rol } from "@/lib/types/auth/rol";
import { Perfil } from "@/lib/types/auth/perfil";

type SearchParams = {
  doc?: string;
};

type EditarUsuarioPageProps = {
  searchParams: Promise<SearchParams>;
};

async function loadRoles() {
  return await appFetch<Rol[]>("/api/rol");
}

async function loadPerfiles() {
  return await appFetch<Perfil[]>("/api/perfil");
}

export default async function EditarUsuarioPage({
  searchParams,
}: EditarUsuarioPageProps) {
  const { doc } = await searchParams;

  if (!doc) {
    notFound();
  }

  const user = await obtenerUsuarioPorDocumento(doc);

  if (!user) {
    notFound();
  }

  const rolesData = await loadRoles();
  const perfilesData = await loadPerfiles();

  return (
    <UserForm
      user={user}
      isEdit={true}
      roles={rolesData.data || []}
      perfiles={perfilesData.data || []}
    />
  );
}
