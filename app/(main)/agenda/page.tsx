"use client";

import * as React from "react";
import {
  Bike,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
} from "lucide-react";

import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ---- Diseño únicamente: datos de ejemplo (sin backend) ----

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HORA_INICIO = 8;
const HORA_FIN = 18;
const HORAS = Array.from(
  { length: HORA_FIN - HORA_INICIO + 1 },
  (_, i) => HORA_INICIO + i,
);

type Estado = "Confirmada" | "Pendiente" | "En taller";

type Cita = {
  dia: number; // 0 = Lunes
  inicio: number; // hora 24h
  duracion: number; // en horas
  cliente: string;
  moto: string;
  servicio: string;
  estado: Estado;
};

const CITAS: Cita[] = [
  { dia: 0, inicio: 8, duracion: 1.5, cliente: "Juan Pérez", moto: "Yamaha FZ", servicio: "Mantenimiento", estado: "Confirmada" },
  { dia: 0, inicio: 11, duracion: 1, cliente: "Ana Gómez", moto: "Honda CB190", servicio: "Cambio de aceite", estado: "Pendiente" },
  { dia: 1, inicio: 9, duracion: 2, cliente: "Carlos Ruiz", moto: "Bajaj Pulsar", servicio: "Revisión de frenos", estado: "En taller" },
  { dia: 2, inicio: 14, duracion: 1, cliente: "Laura Díaz", moto: "Suzuki Gixxer", servicio: "Diagnóstico", estado: "Confirmada" },
  { dia: 3, inicio: 10, duracion: 1.5, cliente: "Pedro Soto", moto: "AKT NKD", servicio: "Cambio de llantas", estado: "Confirmada" },
  { dia: 4, inicio: 8, duracion: 3, cliente: "Sofía Marín", moto: "KTM Duke 200", servicio: "Mantenimiento mayor", estado: "En taller" },
  { dia: 4, inicio: 15, duracion: 1, cliente: "Diego Tovar", moto: "Kawasaki Z400", servicio: "Cambio de aceite", estado: "Pendiente" },
  { dia: 5, inicio: 9, duracion: 2, cliente: "María León", moto: "Honda XR150", servicio: "Revisión general", estado: "Confirmada" },
];

const ESTADO_STYLES: Record<Estado, string> = {
  Confirmada: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  Pendiente: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  "En taller": "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
};

const ESTADO_DOT: Record<Estado, string> = {
  Confirmada: "bg-emerald-500",
  Pendiente: "bg-amber-500",
  "En taller": "bg-sky-500",
};

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function lunesDeLaSemana(offset: number): Date {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 = domingo
  const diffALunes = (dia + 6) % 7;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - diffALunes + offset * 7);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

function formatoHora(h: number): string {
  const hora = Math.floor(h);
  const min = Math.round((h - hora) * 60);
  return `${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export default function AgendaPage() {
  const [vista, setVista] = React.useState<"Día" | "Semana" | "Mes">("Semana");
  const [semanaOffset, setSemanaOffset] = React.useState(0);

  const lunes = lunesDeLaSemana(semanaOffset);
  const fechasSemana = DIAS.map((_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });
  const sabado = fechasSemana[fechasSemana.length - 1];

  const hoy = new Date();
  const esHoy = (d: Date) =>
    d.getDate() === hoy.getDate() &&
    d.getMonth() === hoy.getMonth() &&
    d.getFullYear() === hoy.getFullYear();

  const rangoSemana =
    lunes.getMonth() === sabado.getMonth()
      ? `${lunes.getDate()} – ${sabado.getDate()} ${MESES[sabado.getMonth()]} ${sabado.getFullYear()}`
      : `${lunes.getDate()} ${MESES[lunes.getMonth()]} – ${sabado.getDate()} ${MESES[sabado.getMonth()]} ${sabado.getFullYear()}`;

  const totalSemana = CITAS.length;
  const confirmadas = CITAS.filter((c) => c.estado === "Confirmada").length;
  const pendientes = CITAS.filter((c) => c.estado === "Pendiente").length;
  const enTaller = CITAS.filter((c) => c.estado === "En taller").length;

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Programa y visualiza las citas del taller."
      />

      {/* Barra de herramientas */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSemanaOffset((o) => o - 1)}
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8"
              onClick={() => setSemanaOffset(0)}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSemanaOffset((o) => o + 1)}
              aria-label="Semana siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-2 flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{rangoSemana}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-md border p-0.5">
              {(["Día", "Semana", "Mes"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={cn(
                    "rounded px-3 py-1 text-sm transition-colors",
                    vista === v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button className="h-8">
              <Plus className="mr-2 h-4 w-4" />
              Nueva cita
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResumenItem label="Citas esta semana" valor={totalSemana} dot="bg-primary" />
        <ResumenItem label="Confirmadas" valor={confirmadas} dot={ESTADO_DOT.Confirmada} />
        <ResumenItem label="Pendientes" valor={pendientes} dot={ESTADO_DOT.Pendiente} />
        <ResumenItem label="En taller" valor={enTaller} dot={ESTADO_DOT["En taller"]} />
      </div>

      {/* Calendario semanal */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "4rem repeat(6, minmax(0, 1fr))",
                  gridAutoRows: "3.5rem",
                }}
              >
                {/* Esquina vacía */}
                <div className="border-b border-r" />
                {/* Encabezado de días */}
                {DIAS.map((dia, i) => (
                  <div
                    key={dia}
                    className={cn(
                      "border-b border-r p-2 text-center",
                      esHoy(fechasSemana[i]) && "bg-primary/5",
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {dia}
                    </div>
                    <div
                      className={cn(
                        "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm",
                        esHoy(fechasSemana[i])
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "font-medium",
                      )}
                    >
                      {fechasSemana[i].getDate()}
                    </div>
                  </div>
                ))}

                {/* Filas de horas (etiquetas + celdas de fondo) */}
                {HORAS.map((h, fila) => (
                  <React.Fragment key={h}>
                    <div
                      className="border-b border-r pr-2 pt-1 text-right text-xs text-muted-foreground"
                      style={{ gridColumn: 1, gridRow: fila + 2 }}
                    >
                      {formatoHora(h)}
                    </div>
                    {DIAS.map((_, d) => (
                      <div
                        key={`${h}-${d}`}
                        className={cn(
                          "border-b border-r",
                          esHoy(fechasSemana[d]) && "bg-primary/5",
                        )}
                        style={{ gridColumn: d + 2, gridRow: fila + 2 }}
                      />
                    ))}
                  </React.Fragment>
                ))}

                {/* Citas (superpuestas en la grilla) */}
                {CITAS.map((cita, i) => {
                  const filaInicio = Math.round(cita.inicio - HORA_INICIO) + 2;
                  const span = Math.max(1, Math.round(cita.duracion));
                  return (
                    <div
                      key={i}
                      className={cn(
                        "z-10 m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-md border p-1.5 text-xs shadow-sm",
                        ESTADO_STYLES[cita.estado],
                      )}
                      style={{
                        gridColumn: cita.dia + 2,
                        gridRow: `${filaInicio} / span ${span}`,
                      }}
                    >
                      <span className="font-semibold leading-tight">
                        {cita.servicio}
                      </span>
                      <span className="flex items-center gap-1 opacity-90">
                        <Clock className="h-3 w-3" />
                        {formatoHora(cita.inicio)} –{" "}
                        {formatoHora(cita.inicio + cita.duracion)}
                      </span>
                      <span className="flex items-center gap-1 truncate opacity-90">
                        <User className="h-3 w-3 shrink-0" />
                        {cita.cliente}
                      </span>
                      {span > 1 && (
                        <span className="flex items-center gap-1 truncate opacity-90">
                          <Bike className="h-3 w-3 shrink-0" />
                          {cita.moto}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Estados:</span>
        {(Object.keys(ESTADO_DOT) as Estado[]).map((e) => (
          <span key={e} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", ESTADO_DOT[e])} />
            {e}
          </span>
        ))}
        <Badge variant="outline" className="ml-auto">
          Vista: {vista}
        </Badge>
      </div>
    </>
  );
}

function ResumenItem({
  label,
  valor,
  dot,
}: {
  label: string;
  valor: number;
  dot: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
        <div>
          <div className="text-2xl font-semibold leading-none">{valor}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
