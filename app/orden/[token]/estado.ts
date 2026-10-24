/**
 * F2-01 fase 2: mapea los estados internos de la orden (1-6) al lenguaje y a
 * la línea de tiempo que ve el cliente final. El sistema hoy NO distingue
 * "Diagnóstico" ni "Esperando tu aprobación" como estados propios -- ambos
 * caen dentro de "En Proceso" (2) -- así que la línea de tiempo pública usa
 * 4 pasos reales en vez de los 6 de la referencia de diseño. Nunca se
 * inventan fechas: solo se muestran las 2 que existen de verdad (ingreso y
 * entrega).
 */
import type { PasoHistorial } from "@/lib/types/ordenTrabajo";

export type ColorEstado = "info" | "exito" | "atencion" | "neutro";

export interface EstadoVisual {
  badge: string;
  badgeColor: ColorEstado;
  titulo: string;
  texto: (nombreTaller: string) => string;
  esTerminal: boolean; // Entregada/Garantía: ya no hay nada pendiente del taller
  esAnulada: boolean;
}

const ESTADOS: Record<number, EstadoVisual> = {
  1: {
    badge: "Recibida",
    badgeColor: "info",
    titulo: "Recibimos tu moto",
    texto: () => "Pronto la revisará un mecánico.",
    esTerminal: false,
    esAnulada: false,
  },
  2: {
    badge: "En reparación",
    badgeColor: "info",
    titulo: "¡Gracias! Ya estamos trabajando en tu moto",
    texto: () => "Te avisaremos por WhatsApp apenas esté lista.",
    esTerminal: false,
    esAnulada: false,
  },
  3: {
    badge: "Lista para recoger",
    badgeColor: "exito",
    titulo: "¡Tu moto está lista!",
    texto: () => "Puedes recogerla en nuestro horario de atención.",
    esTerminal: false,
    esAnulada: false,
  },
  4: {
    badge: "Entregada",
    badgeColor: "exito",
    titulo: "Entregamos tu moto",
    texto: (taller) => `Gracias por confiar en ${taller}.`,
    esTerminal: true,
    esAnulada: false,
  },
  5: {
    badge: "Orden anulada",
    badgeColor: "neutro",
    titulo: "Esta orden fue anulada",
    texto: () => "Si tienes dudas, escríbenos.",
    esTerminal: true,
    esAnulada: true,
  },
  6: {
    badge: "Entregada",
    badgeColor: "exito",
    titulo: "Entregamos tu moto",
    texto: (taller) => `Gracias por confiar en ${taller}.`,
    esTerminal: true,
    esAnulada: false,
  },
};

export function estadoVisual(codOtEstOt: number): EstadoVisual {
  return ESTADOS[codOtEstOt] ?? ESTADOS[1];
}

export interface PasoTimeline {
  label: string;
  fecha?: string | null; // ISO date, solo si se conoce de verdad
  estado: "hecho" | "actual" | "pendiente";
}

const PASOS = ["Recibimos tu moto", "En reparación", "Lista para recoger", "Entregada"];

// F2-02: a qué cod_ot_est_ot corresponde cada paso -- para buscar su hora
// real en pasosHistorial (orden_estado_historial). Entregada cubre 4 y 6
// (Garantía se trata como entregada, ver estadoVisual).
const CODIGOS_POR_PASO: ReadonlyArray<readonly number[]> = [[1], [2], [3], [4, 6]];

/** Índice del paso (0-3) en el que está la orden hoy. 4/6 -> último paso. */
function pasoActual(codOtEstOt: number): number {
  if (codOtEstOt >= 4) return 3;
  return Math.max(0, codOtEstOt - 1);
}

/** Primera vez (hora real) que la orden alcanzó alguno de estos códigos, si
 * existe en el historial -- null si la orden es de antes de esa migración. */
function horaDePaso(codigos: readonly number[], historial: PasoHistorial[]): string | null {
  const filas = historial.filter((h) => codigos.includes(h.codOtEstOt));
  if (filas.length === 0) return null;
  return filas.reduce((min, h) => (h.ocurridoEn < min ? h.ocurridoEn : min), filas[0].ocurridoEn);
}

export function pasosTimeline(
  codOtEstOt: number,
  fechaElaboracionOt: string,
  fechaEntregaOt: string | null | undefined,
  pasosHistorial: PasoHistorial[] = []
): PasoTimeline[] {
  const actual = pasoActual(codOtEstOt);
  return PASOS.map((label, i) => {
    let estado: PasoTimeline["estado"] = "pendiente";
    if (i < actual) estado = "hecho";
    else if (i === actual) estado = "actual";

    // Hora real del historial si existe; si no, el fallback de siempre
    // (solo ingreso/entrega, que ya eran columnas reales) -- así las
    // órdenes de antes de esta migración no se rompen.
    let fecha: string | null | undefined = horaDePaso(CODIGOS_POR_PASO[i], pasosHistorial);
    if (!fecha && i === 0) fecha = fechaElaboracionOt;
    if (!fecha && i === 3 && (codOtEstOt === 4 || codOtEstOt === 6)) fecha = fechaEntregaOt;

    return { label, fecha, estado };
  });
}
