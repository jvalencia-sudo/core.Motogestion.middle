import Link from "next/link";
import {
  Bike,
  BadgeCheck,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerPlanesPublico } from "@/app/(main)/planes/actions";

import { HeroVisual } from "./hero-visual";
import { Reveal } from "./reveal";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

const BENEFICIOS = [
  {
    icon: ClipboardList,
    titulo: "Órdenes de trabajo",
    desc: "Crea, asigna y haz seguimiento a cada reparación, con estados y garantías.",
  },
  {
    icon: Users,
    titulo: "Clientes y motos",
    desc: "Toda la información de tus clientes y sus motos en un solo lugar.",
  },
  {
    icon: Package,
    titulo: "Inventario",
    desc: "Controla tu stock de repuestos y mira cuáles están bajos desde el dashboard.",
  },
  {
    icon: LayoutDashboard,
    titulo: "Dashboard en vivo",
    desc: "KPIs y gráficas de tu taller para tomar decisiones al instante.",
  },
  {
    icon: ShieldCheck,
    titulo: "Roles y permisos",
    desc: "Cada miembro de tu equipo ve solo lo que le corresponde.",
  },
  {
    icon: Bike,
    titulo: "Pensado para motos",
    desc: "Diseñado específicamente para la operación de un taller de motos.",
  },
];

const PASOS = [
  {
    n: "1",
    titulo: "Registra tu taller",
    desc: "Crea tu cuenta en minutos. Tu taller queda aislado y seguro.",
  },
  {
    n: "2",
    titulo: "Configura tu equipo",
    desc: "Invita a tus mecánicos y recepcionistas con sus roles.",
  },
  {
    n: "3",
    titulo: "Empieza a gestionar",
    desc: "Registra órdenes, clientes e inventario desde el primer día.",
  },
];

const FAQS_BASE = [
  {
    q: "¿Necesito instalar algo?",
    a: "No. MotoGestión funciona 100% en la web; entras desde cualquier navegador.",
  },
  {
    q: "¿Mis datos están separados de otros talleres?",
    a: "Sí. Cada taller tiene sus datos completamente aislados y seguros.",
  },
  {
    q: "¿Cómo inicio sesión?",
    a: "Con el correo que registras. Puedes entrar con tu cuenta de Google de forma segura.",
  },
];

export default async function LandingPage() {
  const planes = await obtenerPlanesPublico();
  const planPago = planes.find((p) => p.precioPlan > 0);
  const precioAPagar = planPago?.precioAPagar ?? 49000;
  const precioRegular = planPago?.precioPlan ?? 69000;
  // precioAPagar < precioPlan solo mientras queden cupos de fundador (misma
  // regla que usan las tarjetas de precio más abajo). Si ya se acabaron, el
  // backend devuelve precioAPagar === precioPlan y hay que dejar de hablar
  // de "los primeros 10 talleres" -- ya no aplica y sería falso.
  const hayFundador = precioAPagar < precioRegular;
  const faqs = [
    ...FAQS_BASE,
    {
      q: "¿Tiene costo?",
      a: hayFundador
        ? `Puedes probar todo gratis durante 30 días, sin tarjeta. Después, el plan Taller cuesta ${formatoCOP(precioAPagar)} al mes para los primeros 10 talleres.`
        : `Puedes probar todo gratis durante 30 días, sin tarjeta. Después, el plan Taller cuesta ${formatoCOP(precioRegular)} al mes.`,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* gradientes de fondo */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute top-20 right-0 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
              <Wrench className="size-4" /> Software para talleres de motos
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Gestiona tu taller de motos,{" "}
              <span className="text-orange-500">sin enredos.</span>
            </h1>
            <p className="max-w-md text-lg text-slate-400">
              Órdenes de trabajo, clientes, inventario y reportes en un solo lugar.
              Ordenado, rápido y desde cualquier dispositivo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                <Link href="/registro">Registrar mi taller gratis</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <a href="/auth/login?returnTo=/inicio">Ya tengo cuenta</a>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BadgeCheck className="size-4 text-green-500" />
              Empieza gratis · sin tarjeta de crédito
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="border-t border-slate-800 bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">Todo lo que tu taller necesita</h2>
            <p className="mt-3 text-slate-400">
              Una sola herramienta para llevar el día a día de tu taller.
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFICIOS.map((b, i) => (
              <Reveal key={b.titulo} delay={i * 0.05}>
                <Card className="h-full border-slate-800 bg-slate-950 transition-shadow hover:shadow-lg hover:shadow-orange-500/10">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                      <b.icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{b.titulo}</h3>
                    <p className="text-sm text-slate-400">{b.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">Empieza en 3 pasos</h2>
            <p className="mt-3 text-slate-400">De cero a gestionar tu taller en minutos.</p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {PASOS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1} className="text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">
                  {p.n}
                </div>
                <h3 className="text-lg font-semibold text-white">{p.titulo}</h3>
                <p className="mt-2 text-sm text-slate-400">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VISTA DEL PRODUCTO */}
      <section className="border-t border-slate-800 bg-slate-900 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">Un panel claro y al grano</h2>
            <p className="mt-3 text-slate-400">
              Mira el estado de tu taller de un vistazo.
            </p>
          </Reveal>
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-slate-700 shadow-2xl shadow-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dashboard.png"
                alt="Dashboard de MotoGestión"
                className="w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">Un plan simple</h2>
            <p className="mt-3 text-slate-400">
              Empieza gratis. Un solo plan de pago cuando lo necesites.
            </p>
          </Reveal>
          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            {planes.map((plan) => {
              const gratis = plan.precioPlan <= 0;
              const destacado = !gratis;
              const esFundador = !gratis && plan.precioAPagar < plan.precioPlan;
              return (
                <Card
                  key={plan.codPlan}
                  className={
                    destacado
                      ? "relative border-orange-500 bg-slate-900 shadow-lg ring-1 ring-orange-500"
                      : "border-slate-800 bg-slate-900"
                  }
                >
                  {destacado && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
                      Recomendado
                    </span>
                  )}
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{plan.nombrePlan}</h3>
                      <p className="text-sm text-slate-400">
                        {gratis ? "Para empezar hoy mismo, sin tarjeta" : "Para tu día a día"}
                      </p>
                    </div>
                    <div>
                      {esFundador && (
                        <p className="text-sm text-slate-500 line-through">
                          {formatoCOP(plan.precioPlan)}
                        </p>
                      )}
                      <p className="text-3xl font-extrabold text-white">
                        {gratis ? "$0" : formatoCOP(plan.precioAPagar)}
                        {!gratis && <span className="text-sm font-normal text-slate-400"> /mes</span>}
                      </p>
                      {gratis && <p className="text-sm text-slate-400">por 30 días</p>}
                      {esFundador && (
                        <p className="mt-1 text-xs font-medium text-orange-400">
                          Precio fundador: para los primeros 10 talleres, congelado
                          mientras mantengas tu suscripción
                        </p>
                      )}
                    </div>
                    <ul className="flex flex-col gap-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <BadgeCheck className="size-4 text-green-500" /> Todas las funciones
                      </li>
                      <li className="flex items-center gap-2">
                        <BadgeCheck className="size-4 text-green-500" />
                        {plan.maxUsuarios ? `Hasta ${plan.maxUsuarios} usuarios` : "Usuarios ilimitados"}
                      </li>
                      {gratis && (
                        <li className="flex items-center gap-2">
                          <BadgeCheck className="size-4 text-green-500" /> Sin tarjeta de crédito
                        </li>
                      )}
                    </ul>
                    <Button
                      asChild
                      className={
                        destacado
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
                      }
                      variant={destacado ? "default" : "outline"}
                    >
                      <Link href="/registro">
                        {gratis ? "Registrar mi taller" : "Empezar prueba gratis"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {process.env.NEXT_PUBLIC_WHATSAPP_CONTACTO && (
            <p className="mt-8 text-center text-sm text-slate-400">
              ¿Tienes varias sedes o necesitas algo especial?{" "}
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_CONTACTO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-orange-400 hover:text-orange-300"
              >
                <MessageCircle className="size-4" /> Escríbenos por WhatsApp
              </a>
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-800 bg-slate-900 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">Preguntas frecuentes</h2>
          </Reveal>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-slate-800">
                <AccordionTrigger className="text-left text-white hover:text-orange-400">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden border-t border-slate-800 py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Lleva tu taller al siguiente nivel
          </h2>
          <p className="mt-4 text-slate-400">
            Regístrate gratis y empieza a gestionar tu taller hoy mismo.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-orange-500 text-white hover:bg-orange-600"
          >
            <Link href="/registro">Registrar mi taller gratis</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
