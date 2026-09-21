import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="MotoGestión" className="size-8 rounded-md" />
            <span className="text-lg font-bold text-white">MotoGestión</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex">
            <a href="#beneficios" className="hover:text-white">
              Beneficios
            </a>
            <a href="#como-funciona" className="hover:text-white">
              Cómo funciona
            </a>
            <a href="#precios" className="hover:text-white">
              Precios
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-slate-200 hover:text-white sm:inline-flex">
              <a href="/auth/login?returnTo=/inicio">Iniciar sesión</a>
            </Button>
            <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
              <Link href="/registro">Registrar taller</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="MotoGestión" className="size-7 rounded-md" />
            <span className="font-semibold text-white">MotoGestión</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} MotoGestión. Gestión para talleres de motos.
          </p>
          <a
            href="/auth/login?returnTo=/inicio"
            className="text-sm text-slate-400 hover:text-white"
          >
            Iniciar sesión
          </a>
        </div>
      </footer>
    </div>
  );
}
