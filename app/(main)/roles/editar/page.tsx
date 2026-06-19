// app/(main)/roles/editar/page.tsx


import { notFound } from "next/navigation";
import RolForm from "@/app/(main)/roles/rol-form";
import {obtenerRolPorId} from "@/app/(main)/roles/actions";

type SearchParams = {
    cod?: string;
};

type EditarRolPageProps = {
    searchParams: Promise<SearchParams>;
};

export default async function EditarRolPage({
                                                searchParams,
                                            }: EditarRolPageProps) {
    const { cod } = await searchParams;

    if (!cod) {
        notFound();
    }

    const rol = await obtenerRolPorId(cod);

    if (!rol) {
        notFound();
    }

    return <RolForm rol={rol} isEdit={true} />;
}