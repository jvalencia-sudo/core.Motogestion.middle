import { AppSidebar } from "@/components/app-sidebar";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { PermissionProvider } from "@/hooks/use-permissions";
import { getPermissions } from "./actions";
import SuscripcionBanner from "./suscripcion-banner";

// Todo lo que cuelga de (main) está detrás de sesión y usa cookies: nunca
// tiene sentido intentar pre-renderizarlo estático. Sin esto, Next igual
// termina marcando cada ruta dinámica, pero solo después de abortar un
// intento de pre-render que loguea "Dynamic server usage" como si fuera un
// error real en cada actions.ts que usa appFetch.
export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const permissions = await getPermissions();
  return (
    <PermissionProvider permissions={permissions}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SuscripcionBanner />
          <header className="flex h-12 shrink-0 items-center justify-between transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
            <div className="px-4">
              <ThemeToggle />
            </div>
          </header>
          <div className="container mx-auto p-4">{children}</div>
          <Toaster />
        </SidebarInset>
      </SidebarProvider>
    </PermissionProvider>
  );
}
