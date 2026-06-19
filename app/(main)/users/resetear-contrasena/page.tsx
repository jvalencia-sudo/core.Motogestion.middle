import { notFound } from "next/navigation";
import { obtenerUsuarioPorDocumento } from "@/app/(main)/users/actions";
import ResetPasswordForm from "./reset-password-form";

type SearchParams = {
  doc?: string;
};

type ResetPasswordPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ResetearContrasenaPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { doc } = await searchParams;

  if (!doc) {
    notFound();
  }

  const user = await obtenerUsuarioPorDocumento(doc);

  if (!user) {
    notFound();
  }

  return <ResetPasswordForm user={user} />;
}
