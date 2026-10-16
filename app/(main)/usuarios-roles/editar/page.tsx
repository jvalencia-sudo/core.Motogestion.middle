import { notFound } from "next/navigation";
import UserForm from "@/app/(main)/usuarios-roles/user-form";
import {
  obtenerUsuarioPorDocumento,
  obtenerPerfiles,
} from "@/app/(main)/usuarios-roles/actions";

type SearchParams = {
  doc?: string;
};

type EditarUsuarioPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EditarUsuarioPage({ searchParams }: EditarUsuarioPageProps) {
  const { doc } = await searchParams;

  if (!doc) notFound();

  const user = await obtenerUsuarioPorDocumento(doc);
  if (!user) notFound();

  const perfilesData = await obtenerPerfiles();

  return <UserForm user={user} isEdit={true} perfiles={perfilesData.data || []} />;
}
