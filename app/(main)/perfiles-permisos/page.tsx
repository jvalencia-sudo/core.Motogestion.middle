import PageHeader from "@/components/page-header";
import { PerfilesPermisosManager } from "./perfiles-permisos-manager";
import { appFetch } from "@/lib/fetch";
import { PerfilConRol } from "@/lib/types/auth/perfil-permiso";
import { PerfilDetallado } from "@/lib/types/auth/perfil";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { perfilesColumns } from "./perfiles-columns";
import { CreateButton } from "./create-button";

async function loadPerfiles() {
  return await appFetch<PerfilConRol[]>("/api/perfil");
}

async function loadPerfilesDetallados() {
  return await appFetch<PerfilDetallado[]>("/api/perfil/todos");
}

export default async function PerfilesPermisosPage() {
  const [perfilesData, perfilesDetalladosData] = await Promise.all([
    loadPerfiles(),
    loadPerfilesDetallados(),
  ]);

  return (
    <>
      <PageHeader
        title="Gestión de Perfiles y Permisos"
        subtitle="Administra perfiles de usuario y sus permisos asociados."
      />
      <Tabs defaultValue="perfiles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="perfiles">Perfiles</TabsTrigger>
          <TabsTrigger value="permisos">Gestión de Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="perfiles" className="mt-6">
          <DataTable
            columns={perfilesColumns}
            data={perfilesDetalladosData.data || []}
            extraActions={<CreateButton />}
          />
        </TabsContent>

        <TabsContent value="permisos" className="mt-6">
          <PerfilesPermisosManager perfiles={perfilesData.data || []} />
        </TabsContent>
      </Tabs>
    </>
  );
}