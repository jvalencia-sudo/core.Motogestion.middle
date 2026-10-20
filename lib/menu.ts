import { Cpu, Package, Bike, type LucideIcon } from "lucide-react";

// Fuente única del menú lateral: SIN "server-only" (lo usa el sidebar, que es
// cliente) y datos planos (sin lógica de Next/middleware), para que
// tests/middleware.test.ts también pueda recorrerla y confirmar que todo lo
// que aparece acá tiene una regla real en lib/permissions.ts.
//
// Un ítem con `url` (hoja) SIEMPRE exige un permiso real "accion:recurso" del
// catálogo, o `adminOnly` (F1-12: pantallas que el backend siempre gateó con
// require_admin, no con un permiso de catálogo -- "users"/"perfiles-permisos"
// ya no existen como permisos). Un ítem sin `url` (grupo, con `items`) no
// lleva permiso propio: se muestra solo si le queda al menos un hijo visible.
export type MenuItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  permission?: string;
  adminOnly?: boolean;
  items?: MenuItem[];
};

export const MENU: MenuItem[] = [
  {
    title: "Administrador",
    icon: Cpu,
    items: [
      { title: "Mi taller", url: "/mi-taller", adminOnly: true },
      { title: "Usuarios y roles", url: "/usuarios-roles", adminOnly: true },
      { title: "Suscripción", url: "/suscripcion", adminOnly: true },
    ],
  },
  {
    title: "Taller",
    icon: Package,
    items: [
      { title: "Productos", url: "/productos", permission: "ver:productos" },
      { title: "Órdenes de Trabajo", url: "/ordenes-trabajo", permission: "ver:ordenes-trabajo" },
      { title: "Tablero", url: "/tablero", permission: "ver:tablero" },
      { title: "Reclamos", url: "/reclamos", permission: "ver:reclamos" },
      // Planes se sacó del menú a pedido del usuario (no va en el módulo de
      // Taller). La ruta sigue viva y gateada en lib/permissions.ts -- se
      // llega a ella por otro lugar (el banner de suscripción enlaza a
      // /planes), solo no tiene entrada en el menú.
    ],
  },
  {
    title: "Gestión de Motos",
    icon: Bike,
    items: [
      { title: "Clientes", url: "/clientes", permission: "ver:clientes" },
      { title: "Motos", url: "/motos", permission: "ver:motos" },
      { title: "Marcas", url: "/marcas", permission: "ver:marcas" },
    ],
  },
];
