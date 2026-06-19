import { notFound } from "next/navigation";
import ClienteForm from "@/app/(main)/clientes/cliente-form";
import { obtenerClientePorDocumento } from "@/app/(main)/clientes/actions";

type SearchParams = {
  doc?: string;
};

type EditarClientePageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EditarClientePage({
  searchParams,
}: EditarClientePageProps) {
  const { doc } = await searchParams;

  if (!doc) {
    notFound();
  }

  const cliente = await obtenerClientePorDocumento(doc);

  if (!cliente) {
    notFound();
  }

  return <ClienteForm cliente={cliente} isEdit={true} />;
}
