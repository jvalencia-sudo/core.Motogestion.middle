import { notFound } from "next/navigation";
import PerfilForm from "../perfil-form";
import { obtenerPerfilPorId, obtenerRoles } from "../actions";

interface PageProps {
  searchParams: Promise<{ cod?: string }>;
}

export default async function EditarPerfilPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const codPrf = params.cod;

  if (!codPrf) {
    notFound();
  }

  const [perfil, rolesData] = await Promise.all([
    obtenerPerfilPorId(codPrf),
    obtenerRoles(),
  ]);

  if (!perfil) {
    notFound();
  }

  return <PerfilForm perfil={perfil} roles={rolesData.data || []} isEdit={true} />;
}
