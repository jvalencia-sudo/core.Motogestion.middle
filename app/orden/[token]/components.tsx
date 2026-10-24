import { Check } from "lucide-react";
import { ColorEstado, PasoTimeline } from "./estado";

/**
 * Piezas visuales de /orden/[token]. Deliberadamente SIN clases `dark:` ni
 * tokens de shadcn (bg-background, text-muted-foreground, etc.) -- esta
 * página siempre debe verse en modo claro sin importar el tema del sistema
 * ni el de la cuenta logueada (la ve el cliente final, sin login). Usar solo
 * paleta literal de Tailwind.
 */

const BADGE_CLASES: Record<ColorEstado, string> = {
  info: "bg-blue-100 text-blue-800",
  exito: "bg-green-100 text-green-800",
  atencion: "bg-amber-100 text-amber-800",
  neutro: "bg-gray-200 text-gray-700",
};

export function EstadoBadge({ color, children }: Readonly<{ color: ColorEstado; children: React.ReactNode }>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold print:border print:border-black print:bg-transparent print:text-black ${BADGE_CLASES[color]}`}
    >
      {children}
    </span>
  );
}

export function Placa({ placa, ciudad }: Readonly<{ placa: string; ciudad?: string | null }>) {
  const fila1 = placa.slice(0, 3);
  const fila2 = placa.slice(3);
  return (
    <div
      role="img"
      aria-label={`Placa ${placa}`}
      className="mg-print-exact flex h-[74px] w-[92px] shrink-0 flex-col items-center justify-center rounded-lg border-[3px] border-gray-900 bg-[#FFD100] leading-none print:break-inside-avoid"
    >
      <span className="text-[22px] font-extrabold tracking-wider text-gray-900">{fila1}</span>
      <span className="mt-0.5 text-[22px] font-extrabold tracking-wider text-gray-900">{fila2}</span>
      {ciudad && (
        <span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-gray-900">{ciudad}</span>
      )}
    </div>
  );
}

export function Iniciales({ nombre, className = "" }: Readonly<{ nombre: string; className?: string }>) {
  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-gray-200 font-bold text-gray-700 ${className}`}
    >
      {iniciales}
    </div>
  );
}

export function LogoTaller({ nombre, logoDataUri }: Readonly<{ nombre: string; logoDataUri?: string | null }>) {
  if (logoDataUri) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoDataUri}
        alt={nombre}
        className="mg-print-exact h-11 w-11 rounded-xl object-contain"
      />
    );
  }
  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div className="mg-print-exact grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gray-900 text-base font-extrabold text-white">
      {iniciales}
    </div>
  );
}

const DOT_COLOR: Record<"actual-info" | "actual-exito" | "actual-atencion", string> = {
  "actual-info": "border-blue-600",
  "actual-exito": "border-green-700",
  "actual-atencion": "border-amber-600",
};

export function Timeline({ pasos, colorActual = "info" }: Readonly<{ pasos: PasoTimeline[]; colorActual?: "info" | "exito" | "atencion" }>) {
  return (
    <ol className="flex flex-col">
      {pasos.map((paso, i) => {
        const esUltimo = i === pasos.length - 1;
        return (
          <li key={paso.label} className="flex gap-3.5">
            <div className="flex w-6 flex-col items-center">
              {paso.estado === "hecho" && (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-700">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </span>
              )}
              {paso.estado === "actual" && (
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-[3px] bg-white ${DOT_COLOR[`actual-${colorActual}`]}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      colorActual === "exito"
                        ? "bg-green-700"
                        : colorActual === "atencion"
                          ? "bg-amber-600"
                          : "bg-blue-600"
                    }`}
                  />
                </span>
              )}
              {paso.estado === "pendiente" && (
                <span className="h-6 w-6 shrink-0 rounded-full border-2 border-gray-300 bg-white" />
              )}
              {!esUltimo && (
                <span className={`min-h-[22px] w-0.5 grow ${paso.estado === "hecho" ? "bg-green-700" : "bg-gray-200"}`} />
              )}
            </div>
            <div className="flex flex-col gap-0.5 pb-[18px] pt-0.5">
              <span
                className={`text-[15px] ${
                  paso.estado === "actual"
                    ? "font-bold text-gray-900"
                    : paso.estado === "pendiente"
                      ? "text-gray-400"
                      : "font-medium text-gray-900"
                }`}
              >
                {paso.label}
              </span>
              {paso.estado === "actual" && !paso.fecha && (
                <span className="text-[13px] text-gray-500">Ahora</span>
              )}
              {paso.fecha && <span className="text-[13px] text-gray-500">{paso.fecha}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
