import Link from "next/link";
import {
  AlertTriangle,
  Bike,
  ClipboardList,
  MessageSquareWarning,
  Package,
  Users,
  Wrench,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumenDashboard } from "@/lib/types/dashboard";

const EMPTY: ResumenDashboard = {
  totalClientes: 0,
  totalMotos: 0,
  totalProductos: 0,
  totalOrdenes: 0,
  otActivas: 0,
  productosBajoStock: 0,
  totalReclamos: 0,
  ordenesPorEstado: [],
};

// Color por estado de la orden (coincide con el orden del seed de ot_estados)
const ESTADO_COLOR: Record<number, string> = {
  1: "bg-amber-500", // Pendiente
  2: "bg-blue-500", // En Proceso
  3: "bg-emerald-500", // Completada
  4: "bg-slate-500", // Entregada
  5: "bg-rose-500", // Cancelada
  6: "bg-violet-500", // Garantía
};

function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex size-11 items-center justify-center rounded-lg ${accent}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold leading-none">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

const ACCESOS = [
  { href: "/ordenes-trabajo", label: "Órdenes", icon: <ClipboardList className="size-5" /> },
  { href: "/clientes", label: "Clientes", icon: <Users className="size-5" /> },
  { href: "/motos", label: "Motos", icon: <Bike className="size-5" /> },
  { href: "/productos", label: "Productos", icon: <Package className="size-5" /> },
  { href: "/reclamos", label: "Reclamos", icon: <MessageSquareWarning className="size-5" /> },
];

export function DashboardResumen({ resumen }: { resumen: ResumenDashboard | null }) {
  const r = resumen ?? EMPTY;
  const maxEstado = Math.max(1, ...r.ordenesPorEstado.map((e) => e.cantidad));

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          icon={<Wrench className="size-5 text-white" />}
          label="Órdenes activas"
          value={r.otActivas}
          accent="bg-blue-500"
        />
        <Kpi
          icon={<ClipboardList className="size-5 text-white" />}
          label="Órdenes totales"
          value={r.totalOrdenes}
          accent="bg-indigo-500"
        />
        <Kpi
          icon={<Users className="size-5 text-white" />}
          label="Clientes"
          value={r.totalClientes}
          accent="bg-emerald-500"
        />
        <Kpi
          icon={<Bike className="size-5 text-white" />}
          label="Motos"
          value={r.totalMotos}
          accent="bg-violet-500"
        />
        <Kpi
          icon={<Package className="size-5 text-white" />}
          label="Productos"
          value={r.totalProductos}
          accent="bg-amber-500"
        />
        <Kpi
          icon={<AlertTriangle className="size-5 text-white" />}
          label="Bajo stock"
          value={r.productosBajoStock}
          accent="bg-rose-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfica: órdenes por estado */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Órdenes por estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {r.ordenesPorEstado.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            ) : (
              r.ordenesPorEstado.map((e) => (
                <div key={e.codOtEst} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-muted-foreground">
                    {e.nombreOtEst}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${ESTADO_COLOR[e.codOtEst] ?? "bg-primary"}`}
                      style={{ width: `${(e.cantidad / maxEstado) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm font-medium">
                    {e.cantidad}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Accesos rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {ACCESOS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {a.icon}
                {a.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
