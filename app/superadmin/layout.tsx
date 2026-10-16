import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/theme-toggle";
import { SuperAdminSidebar } from "./superadmin-sidebar";

// Sección aislada del resto de la app (F0-14): su propio shell, sin
// AppSidebar/PermissionProvider (eso es taller-scoped). El middleware ya
// garantiza que solo un super-admin llega hasta aquí -- ver middleware.ts.
export const dynamic = "force-dynamic";

export default function SuperAdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SuperAdminSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center justify-between transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              Panel de super administrador
            </span>
          </div>
          <div className="px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="container mx-auto p-4">{children}</div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
