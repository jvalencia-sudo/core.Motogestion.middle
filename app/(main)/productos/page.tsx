import { CirclePlusIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { appFetch } from "@/lib/fetch";
import { Producto } from "@/lib/types/producto";

async function loadProductosData() {
  return await appFetch<Producto[]>("/api/productos");
}

export default async function ProductosPage() {
  const productosData = await loadProductosData();

  console.log("📦 Productos cargados:", productosData);

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Administra todos los productos del taller."
      />
      <DataTable
        columns={columns}
        data={productosData.data || []}
        extraActions={
          <>
            <Link href="/productos/crear">
              <Button className="h-8">
                <CirclePlusIcon className="mr-2 h-4 w-4" />
                Crear Producto
              </Button>
            </Link>
          </>
        }
      />
    </>
  );
}
