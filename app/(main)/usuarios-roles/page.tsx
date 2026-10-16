import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsuariosTab from "./usuarios-tab";
import RolesTab from "./roles-tab";
import { obtenerPerfilesDetallados, obtenerCatalogoPermisos } from "./actions";

export default async function UsuariosRolesPage() {
  const [perfilesData, catalogoData] = await Promise.all([
    obtenerPerfilesDetallados(),
    obtenerCatalogoPermisos(),
  ]);

  return (
    <>
      <PageHeader
        title="Usuarios y roles"
        subtitle="Gestiona los usuarios del taller y qué puede hacer cada rol."
      />
      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-6">
          <UsuariosTab />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesTab perfiles={perfilesData.data || []} catalogo={catalogoData.data || []} />
        </TabsContent>
      </Tabs>
    </>
  );
}
