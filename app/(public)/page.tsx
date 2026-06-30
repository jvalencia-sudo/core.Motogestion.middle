import Link from "next/link";
import {
  Bike,
  BadgeCheck,
  ClipboardList,
  LayoutDashboard,
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

import { HeroVisual } from "./hero-visual";
import { Reveal } from "./reveal";

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
    desc: "Controla tu stock de repuestos y recibe alertas de bajo inventario.",
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

const PLANES = [
  {
    nombre: "Prueba",
    precio: "Gratis",
    detalle: "Para empezar hoy mismo",
    features: ["Todas las funciones", "1 taller", "Soporte por correo"],
    destacado: false,
  },
  {
    nombre: "Profesional",
    precio: "Próximamente",
    detalle: "Para talleres en crecimiento",
    features: ["Todo lo de Prueba", "Usuarios ilimitados", "Reportes avanzados"],
    destacado: true,
  },
  {
    nombre: "Premium",
    precio: "Próximamente",
    detalle: "Para varias sucursales",
    features: ["Todo lo de Profesional", "Multi-sucursal", "Soporte prioritario"],
    destacado: false,
  },
];

const FAQS = [
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
  {
    q: "¿Tiene costo?",
    a: "Puedes empezar gratis en modo prueba. Más adelante habrá planes según tu taller.",
  },
];

export default function LandingPage() {
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
                <Link href="/auth/login?returnTo=/inicio">Ya tengo cuenta</Link>
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
            <h2 className="text-3xl font-bold text-white">Planes simples</h2>
            <p className="mt-3 text-slate-400">
              Empieza gratis. Los planes de pago llegan pronto.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANES.map((plan) => (
              <Card
                key={plan.nombre}
                className={
                  plan.destacado
                    ? "relative border-orange-500 bg-slate-900 shadow-lg ring-1 ring-orange-500"
                    : "border-slate-800 bg-slate-900"
                }
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Recomendado
                  </span>
                )}
                <CardContent className="flex flex-col gap-4 p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.nombre}</h3>
                    <p className="text-sm text-slate-400">{plan.detalle}</p>
                  </div>
                  <p className="text-3xl font-extrabold text-white">{plan.precio}</p>
                  <ul className="flex flex-col gap-2 text-sm text-slate-300">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <BadgeCheck className="size-4 text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={
                      plan.destacado
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
                    }
                    variant={plan.destacado ? "default" : "outline"}
                  >
                    <Link href="/registro">Empezar gratis</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-800 bg-slate-900 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">Preguntas frecuentes</h2>
          </Reveal>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
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
