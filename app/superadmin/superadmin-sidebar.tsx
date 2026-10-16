import { LayoutDashboard, Store, Wallet } from "lucide-react";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Nav fija de 3 ítems (F0-14): todo-o-nada a nivel de sección (el middleware
// ya bloquea /superadmin/* para quien no sea super-admin), así que -- a
// diferencia de components/app-sidebar.tsx -- no hay nada que filtrar por
// permiso aquí.
const ITEMS = [
  { title: "Resumen", url: "/superadmin", icon: LayoutDashboard },
  { title: "Talleres", url: "/superadmin/talleres", icon: Store },
  { title: "Pagos", url: "/superadmin/pagos", icon: Wallet },
];

export function SuperAdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/superadmin">
                <LayoutDashboard className="size-5" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MotoGestión</span>
                  <span className="truncate text-xs">Super Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={ITEMS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
