import { Cpu, Package, Bike, type LucideIcon } from "lucide-react";

// Fuente única del menú lateral: SIN "server-only" (lo usa el sidebar, que es
// cliente) y datos planos (sin lógica de Next/middleware), para que
// tests/middleware.test.ts también pueda recorrerla y confirmar que todo lo
// que aparece acá tiene una regla real en lib/permissions.ts.
//
// Un ítem con `url` (hoja) SIEMPRE exige un permiso real "accion:recurso" del
// catálogo -- ya no existe la regla vieja de "si el permiso no tiene ':' se
// muestra siempre" (F0-13). Un ítem sin `url` (grupo, con `items`) no lleva
// permiso propio: se muestra solo si le queda al menos un hijo visible.
export type MenuItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  permission?: string;
  items?: MenuItem[];
};

export const MENU: MenuItem[] = [
  {
    title: "Administrador",
    icon: Cpu,
    items: [
      { title: "Mi taller", url: "/mi-taller", permission: "leer:users" },
      { title: "Usuarios y roles", url: "/usuarios-roles", permission: "leer:users" },
      { title: "Suscripción", url: "/suscripcion", permission: "leer:users" },
    ],
  },
  {
    title: "Taller",
    icon: Package,
    items: [
      { title: "Productos", url: "/productos", permission: "leer:productos" },
      { title: "Órdenes de Trabajo", url: "/ordenes-trabajo", permission: "leer:ordenes-trabajo" },
      { title: "Tablero", url: "/tablero", permission: "leer:ordenes-trabajo" },
      { title: "Reclamos", url: "/reclamos", permission: "leer:reclamos" },
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
      { title: "Clientes", url: "/clientes", permission: "leer:clientes" },
      { title: "Motos", url: "/motos", permission: "leer:motos" },
      { title: "Marcas", url: "/marcas", permission: "leer:marcas" },
    ],
  },
];
