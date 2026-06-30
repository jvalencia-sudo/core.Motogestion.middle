import { RegistroForm } from "./registro-form";

export default function RegistroPage() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Registra tu taller</h1>
          <p className="mt-2 text-slate-400">
            Crea tu cuenta gratis y empieza a gestionar tu taller hoy.
          </p>
        </div>

        <RegistroForm />
      </div>
    </section>
  );
}
