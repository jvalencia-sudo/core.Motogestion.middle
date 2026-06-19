"use server";
import { AppSidebar } from "@/components/app-sidebar";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { PermissionProvider } from "@/hooks/use-permissions";
import { getPermissions } from "./actions";

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
          <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
          </header>
          <div className="container mx-auto p-4">{children}</div>
          <Toaster />
        </SidebarInset>
      </SidebarProvider>
    </PermissionProvider>
  );
}
