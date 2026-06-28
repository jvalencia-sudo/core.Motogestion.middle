"use client";

import * as React from "react";
import { Cpu, Package, Bike, Home, CalendarDays } from "lucide-react";

import { getPermissions } from "@/app/(main)/actions";
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

type NavItem = {
  title: string;
  url?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: Array<NavItem | null>;
};

function getItem(
  permissions: string[],
  title: string,
  permission: string,
  url?: string,
  icon?: any,
  items?: Array<NavItem | null>,
): NavItem | null {
  //We check if the permission has a : because it's a group if it doesn't
  if (permission.includes(":") && !permissions.includes(permission))
    return null;

  return {
    icon,
    title,
    items,
    url,
  };
}

//TODO: Add active state
function getMenu(permissions: string[]): NavItem[] {
  const menu = [
    getItem(permissions, "Administrador", "leer:users", "", Cpu, [
      getItem(permissions, "Usuarios", "leer:users", "/users"),
      getItem(permissions, "Roles", "leer:roles", "/roles"),
      getItem(permissions, "Vistas", "leer:vistas", "/vistas"),
      getItem(permissions, "Perfiles y Permisos", "leer:perfiles-permisos", "/perfiles-permisos"),
    ]),
      getItem(permissions, "Taller", "Ver Productos", "", Package, [
          getItem(permissions, "Productos", "Ver Productos", "/productos"),
          getItem(permissions, "Órdenes de Trabajo", "Ver Órdenes Trabajo", "/ordenes-trabajo"),
          getItem(permissions, "Reclamos", "leer:reclamos", "/reclamos"),
      ]),
      getItem(permissions, "Gestión de Motos", "Ver Clientes", "", Bike, [
          getItem(permissions, "Clientes", "Ver Clientes", "/clientes"),
          getItem(permissions, "Motos", "Ver Motos", "/motos"),
      ]),
      getItem(permissions, "Agenda", "leer:ordenes-trabajo", "", CalendarDays, [
          getItem(permissions, "Citas", "leer:ordenes-trabajo", "/agenda"),
      ]),
  ];

  // 🧹 Limpiar nulos tanto en el nivel principal como en los hijos
  const clean = (items: Array<NavItem | null>): NavItem[] =>
      items
          .filter((i): i is NavItem => i !== null)
          .map((i) => ({
            ...i,
            items: i.items ? clean(i.items) : undefined,
          }))
          .filter((i) => !i.items || i.items.length > 0);

  return clean(menu);
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [permissions, setPermissions] = React.useState<string[]>([]);
  React.useEffect(() => {
    const getP = async () => {
      setPermissions(await getPermissions());
    };
    getP();
  }, []);

  const items = React.useMemo(() => {
    return getMenu(permissions);
  }, [permissions]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
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
        <NavMain items={items as any} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
