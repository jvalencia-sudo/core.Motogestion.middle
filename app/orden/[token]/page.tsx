import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Clock, Info, MapPin, Phone, MessageCircle, Navigation } from "lucide-react";

import { obtenerEstadoPublicoOrden } from "../actions";
import { estadoVisual, pasosTimeline } from "./estado";
import { EstadoBadge, Iniciales, LogoTaller, Placa, Timeline } from "./components";
import { BotonImprimir } from "./boton-imprimir";
import { AprobarCotizacion } from "./aprobar-cotizacion";
import type { OrdenPublica, OrdenPublicaItem } from "@/lib/types/ordenTrabajo";

interface PaginaOrdenPublicaProps {
  params: Promise<{ token: string }>;
}

// F2-01: página pública (sin login) de estado de una orden -- no debe
// aparecer en buscadores, y la vista previa del link (WhatsApp) debe mostrar
// el taller y la placa en vez de un título genérico.
export async function generateMetadata({ params }: PaginaOrdenPublicaProps): Promise<Metadata> {
  const { token } = await params;
  const orden = await obtenerEstadoPublicoOrden(token);
  if (!orden) {
    return { title: "Estado de tu orden", robots: { index: false, follow: false } };
  }
  const titulo = `Tu moto ${orden.placaMot} · ${orden.taller.nombreComercial}`;
  const descripcion = estadoVisual(orden.codOtEstOt).titulo;
  return {
    title: titulo,
    robots: { index: false, follow: false },
    openGraph: {
      title: titulo,
      description: descripcion,
      images: orden.taller.logoDataUri ? [orden.taller.logoDataUri] : undefined,
    },
  };
}

function formatearFechaCorta(fecha?: string | null): string | null {
  if (!fecha) return null;
  const [anio, mes, dia] = fecha.split("T")[0].split("-");
  const nombre = new Intl.DateTimeFormat("es-CO", { month: "short", timeZone: "America/Bogota" }).format(
    new Date(Number(anio), Number(mes) - 1, Number(dia))
  );
  return `${Number(dia)} ${nombre.replace(".", "")}`;
}

function formatearFechaHora(fecha?: string | null): string | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  const dia = formatearFechaCorta(fecha);
  const hora = new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(d);
  return `${dia}, ${hora}`;
}

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function linkWhatsapp(whatsapp: string, placa: string, numeroOrden: number) {
  const soloDigitos = whatsapp.replace(/\D/g, "");
  const numero = soloDigitos.startsWith("57") ? soloDigitos : `57${soloDigitos}`;
  const texto = encodeURIComponent(
    `Hola, pregunto por mi moto placa ${placa} (orden #${numeroOrden}).`
  );
  return `https://wa.me/${numero}?text=${texto}`;
}

function linkMapa(direccion: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

const ETIQUETA_GRUPO: Record<OrdenPublicaItem["tipo"], string> = {
  BIEN: "Repuestos",
  PAQUETE: "Repuestos",
  SERVICIO: "Mano de obra",
};

function agruparItems(items: OrdenPublicaItem[]) {
  const grupos = new Map<string, OrdenPublicaItem[]>();
  for (const item of items) {
    const etiqueta = ETIQUETA_GRUPO[item.tipo];
    grupos.set(etiqueta, [...(grupos.get(etiqueta) ?? []), item]);
  }
  // Repuestos antes de Mano de obra, igual que la referencia.
  return [...grupos.entries()].sort((a) => (a[0] === "Repuestos" ? -1 : 1));
}

export default async function OrdenPublicaPage({ params }: PaginaOrdenPublicaProps) {
  const { token } = await params;
  const orden: OrdenPublica | null = await obtenerEstadoPublicoOrden(token);

  if (!orden) {
    notFound();
  }

  const estado = estadoVisual(orden.codOtEstOt);
  const esGarantia = orden.codOtEstOt === 6;
  const esListaParaRecoger = orden.codOtEstOt === 3;
  const color = orden.taller.colorPrincipal;
  const pasos = pasosTimeline(
    orden.codOtEstOt,
    orden.fechaElaboracionOt,
    orden.fechaEntregaOt,
    orden.pasosHistorial
  ).map((paso) => ({ ...paso, fecha: formatearFechaCorta(paso.fecha) }));
  const colorActual = estado.badgeColor === "exito" ? "exito" : "info";

  const totalLabel = orden.esperandoAprobacion
    ? "Total estimado"
    : orden.codOtEstOt === 4 || orden.codOtEstOt === 6
      ? "Total pagado"
      : "Total a pagar";

  const tieneDireccion = Boolean(orden.taller.direccion);
  const tieneTelefono = Boolean(orden.taller.telefono);
  const tieneWhatsapp = Boolean(orden.taller.whatsapp);
  const tieneHorario = Boolean(orden.taller.horario);

  const itemsActivos = (orden.items ?? []).filter((item) => !item.retirado);
  const itemsRetirados = (orden.items ?? []).filter((item) => item.retirado);

  const bloqueTaller = (tieneDireccion || tieneTelefono || tieneWhatsapp) && (
    <section key="taller" className="flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 print:hidden">
      <h2 className="text-base font-bold text-gray-900">
        {esListaParaRecoger ? "Pasa por ella aquí" : orden.taller.nombreComercial}
      </h2>
      {tieneDireccion && (
        <div className="flex items-start gap-2.5 text-[14px] text-gray-700">
          <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-500" />
          <span>{orden.taller.direccion}</span>
        </div>
      )}
      {tieneHorario && (
        <div className="flex items-start gap-2.5 text-[14px] text-gray-700">
          <Clock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-500" />
          <span>{orden.taller.horario}</span>
        </div>
      )}

      {esListaParaRecoger ? (
        <>
          {tieneDireccion && (
            <a
              href={linkMapa(orden.taller.direccion!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white"
              style={{ backgroundColor: color }}
            >
              <Navigation className="h-[18px] w-[18px]" />
              Cómo llegar
            </a>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {tieneTelefono && (
              <a
                href={`tel:${orden.taller.telefono}`}
                className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-900"
              >
                <Phone className="h-4 w-4" />
                Llamar
              </a>
            )}
            {tieneWhatsapp && (
              <a
                href={linkWhatsapp(orden.taller.whatsapp!, orden.placaMot, orden.consecutivoOt)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-[#15803D] bg-white text-sm font-bold text-[#15803D]"
              >
                WhatsApp
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          {(tieneDireccion || tieneTelefono) && (
            <div className="grid grid-cols-2 gap-2.5">
              {tieneDireccion && (
                <a
                  href={linkMapa(orden.taller.direccion!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-900"
                >
                  Cómo llegar
                </a>
              )}
              {tieneTelefono && (
                <a
                  href={`tel:${orden.taller.telefono}`}
                  className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-900"
                >
                  <Phone className="h-4 w-4" />
                  Llamar
                </a>
              )}
            </div>
          )}
          {tieneWhatsapp && (
            <a
              href={linkWhatsapp(orden.taller.whatsapp!, orden.placaMot, orden.consecutivoOt)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] text-[15px] font-bold text-white"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              Escribir al taller por WhatsApp
            </a>
          )}
        </>
      )}
    </section>
  );

  const bloqueMoto = (
    <section
      key="moto"
      className="flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 print:break-inside-avoid"
    >
      <div className="flex items-center gap-4">
        <Placa placa={orden.placaMot} ciudad={orden.ciudadPlacaMot} />
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-gray-900">
            {orden.marcaMoto} {orden.modeloMot}
          </span>
          <span className="text-sm text-gray-500">
            {new Intl.NumberFormat("es-CO").format(orden.kilometrajeIngresoOt)} km de ingreso
          </span>
          {!estado.esTerminal && !estado.esAnulada && (
            <span className="text-[13px] text-gray-500">
              Ingresó el {formatearFechaCorta(orden.fechaElaboracionOt)}
            </span>
          )}
        </div>
      </div>
      {orden.mecanico && !estado.esAnulada && (
        <>
          {!estado.esTerminal && <div className="h-px bg-gray-200" />}
          <div className="flex items-center gap-3">
            <Iniciales nombre={orden.mecanico} className="h-10 w-10 text-sm" />
            <div>
              {!estado.esTerminal ? (
                <>
                  <p className="text-xs text-gray-500">Te atiende</p>
                  <p className="text-[15px] font-semibold text-gray-900">{orden.mecanico} · Mecánico</p>
                </>
              ) : (
                <p className="text-[15px] font-semibold text-gray-900">Atendió: {orden.mecanico}</p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );

  const bloqueEstado = (
    <section
      key="estado"
      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 print:break-inside-avoid"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <EstadoBadge color={estado.badgeColor}>{estado.badge}</EstadoBadge>
          {esGarantia && <EstadoBadge color="info">Garantía</EstadoBadge>}
        </div>
        <h1 className="text-[22px] font-extrabold leading-tight text-gray-900 print:text-[16pt]">
          {estado.titulo}
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-600 print:hidden">
          {estado.texto(orden.taller.nombreComercial)}
        </p>
      </div>
      {!estado.esAnulada && (
        <div className="print:hidden">
          <Timeline pasos={pasos} colorActual={colorActual} />
        </div>
      )}
    </section>
  );

  const bloqueCotizacion = itemsActivos.length > 0 && (
    <section
      key="cotizacion"
      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 print:break-inside-avoid"
    >
      <h2 className="text-base font-bold text-gray-900">
        {esListaParaRecoger ? "Resumen del trabajo" : "Cotización"}
      </h2>

      {esListaParaRecoger ? (
        <div className="flex flex-col gap-2">
          {itemsActivos.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className={`text-sm ${item.cobrado ? "text-gray-700" : "text-gray-400 line-through"}`}>
                {item.nombre}
              </span>
              <span
                className={`text-sm font-semibold tabular-nums ${item.cobrado ? "text-gray-900" : "text-gray-400"}`}
              >
                {formatearMoneda(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        agruparItems(itemsActivos).map(([grupo, items]) => (
          <div key={grupo} className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{grupo}</span>
            {items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <span className={`text-[15px] ${item.cobrado ? "font-medium text-gray-900" : "text-gray-400 line-through"}`}>
                  {item.cantidad > 1 ? `${item.cantidad} × ` : ""}
                  {item.nombre}
                </span>
                <span
                  className={`whitespace-nowrap text-[15px] font-semibold tabular-nums ${
                    item.cobrado ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {formatearMoneda(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        ))
      )}

      {/* F2-02: ítems retirados -- no se tachan en la lista, van aparte con su motivo */}
      {itemsRetirados.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {itemsRetirados.map((item, i) => (
            <div
              key={`retirado-${i}`}
              className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5 text-[13px] text-gray-500"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>
                Retiramos de la cotización: {item.nombre}
                {item.motivoRetiro ? ` (${item.motivoRetiro})` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {orden.totalOt !== null && (
        <>
          <div className="h-px bg-gray-200" />
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">{totalLabel}</span>
            <span className="text-2xl font-extrabold tabular-nums text-gray-900 print:text-[18pt]">
              {formatearMoneda(orden.totalOt)}
            </span>
          </div>
          {orden.esperandoAprobacion && (
            <p className="text-[13px] leading-relaxed text-gray-500 print:hidden">
              Si encontramos algo más, te consultamos antes de hacerlo.
            </p>
          )}
          {orden.esperandoAprobacion && (
            <div className="print:hidden">
              <AprobarCotizacion
                token={token}
                totalFormateado={formatearMoneda(orden.totalOt)}
                whatsappHref={
                  tieneWhatsapp
                    ? linkWhatsapp(orden.taller.whatsapp!, orden.placaMot, orden.consecutivoOt)
                    : null
                }
              />
            </div>
          )}
          {orden.aprobadoEn && !orden.esperandoAprobacion && (
            <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
              <Check className="h-5 w-5 shrink-0" />
              Aprobaste esta cotización el {formatearFechaHora(orden.aprobadoEn)}.
            </div>
          )}
          <BotonImprimir />
        </>
      )}
    </section>
  );

  const bloqueDiagnostico = orden.diagnostico && (
    <section
      key="diagnostico"
      className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5 print:break-inside-avoid"
    >
      <h2 className="text-base font-bold text-gray-900">Diagnóstico del mecánico</h2>
      <p className="text-[15px] leading-relaxed text-gray-700">{orden.diagnostico}</p>
    </section>
  );

  const bloquesCuerpo = estado.esAnulada
    ? [bloqueMoto, bloqueEstado, bloqueTaller]
    : esListaParaRecoger
      ? [bloqueMoto, bloqueEstado, bloqueTaller, bloqueCotizacion]
      : [bloqueMoto, bloqueEstado, bloqueDiagnostico, bloqueCotizacion, bloqueTaller];

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 print:bg-white" style={{ colorScheme: "light" }}>
      {/* @page y print-color-adjust no se pueden expresar con utilidades de Tailwind. */}
      <style>{`
        @media print {
          @page { size: letter; margin: 14mm; }
          .mg-print-exact {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>

      <header className="w-full px-4 py-3 md:border-b md:border-gray-200 md:bg-white md:px-6 md:py-3.5 print:px-0 print:py-0 print:pb-[8pt]">
        <div className="mx-auto flex w-full max-w-[390px] items-center justify-between gap-3 md:max-w-[960px] print:max-w-none">
          <div className="flex items-center gap-3">
            <LogoTaller nombre={orden.taller.nombreComercial} logoDataUri={orden.taller.logoDataUri} />
            <div>
              <p className="text-[17px] font-bold text-gray-900">{orden.taller.nombreComercial}</p>
              <p className="text-[13px] text-gray-500">Orden #{orden.consecutivoOt}</p>
              {(tieneDireccion || tieneTelefono || orden.taller.nit) && (
                <p className="hidden text-[11px] text-gray-500 print:block">
                  {[
                    orden.taller.direccion,
                    orden.taller.telefono,
                    orden.taller.nit ? `NIT ${orden.taller.nit}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
          {tieneWhatsapp && (
            <a
              href={linkWhatsapp(orden.taller.whatsapp!, orden.placaMot, orden.consecutivoOt)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-[#15803D] px-[18px] text-sm font-bold text-white md:inline-flex print:hidden"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              Escribir por WhatsApp
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 py-5 sm:py-8 md:max-w-[480px] md:py-8 print:max-w-none print:gap-[8pt] print:px-0 print:py-0">
        {bloquesCuerpo}

        <p className="hidden text-center text-[9pt] text-gray-600 print:block">
          Este documento es un comprobante de la orden de servicio y no constituye factura electrónica.
        </p>

        {orden.taller.mostrarPieMotogestion && (
          <footer className="flex items-center justify-center gap-1 pb-4 pt-2 text-xs text-gray-500 print:text-black">
            Hecho con{" "}
            <Link
              href="/"
              className="font-semibold text-blue-700 hover:underline print:text-black print:no-underline"
            >
              MotoGestión
            </Link>
          </footer>
        )}
      </main>
    </div>
  );
}
