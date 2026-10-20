"use client";

import * as React from "react";
import { Home, type LucideIcon } from "lucide-react";

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
import Link from "next/link";

import { usePermissions } from "@/hooks/use-permissions";
import { MENU, type MenuItem } from "@/lib/menu";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
};

// Una hoja (tiene url) SIEMPRE exige su permiso real, o `adminOnly` (F1-12:
// pantallas que el backend siempre gateó con require_admin, no con un
// permiso de catálogo); un grupo (sin url, con items) no tiene permiso
// propio, se queda solo si le sobrevive algún hijo.
function filtrarMenu(items: MenuItem[], permissions: string[], esAdmin: boolean): NavItem[] {
  return items
    .map((item): NavItem | null => {
      if (item.items) {
        const hijos = filtrarMenu(item.items, permissions, esAdmin);
        if (hijos.length === 0) return null;
        return { title: item.title, url: "", icon: item.icon, items: hijos };
      }
      if (item.adminOnly) {
        if (!esAdmin) return null;
      } else if (!item.permission || !permissions.includes(item.permission)) {
        return null;
      }
      return { title: item.title, url: item.url ?? "", icon: item.icon };
    })
    .filter((i): i is NavItem => i !== null);
}

function getMenu(permissions: string[], esAdmin: boolean): NavItem[] {
  return filtrarMenu(MENU, permissions, esAdmin);
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { permissions, esAdmin } = usePermissions();

  const items = React.useMemo(() => {
    return getMenu(permissions, esAdmin);
  }, [permissions, esAdmin]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/inicio">
                <Home className="size-5" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MotoGestión</span>
                  <span className="truncate text-xs">CRM</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
