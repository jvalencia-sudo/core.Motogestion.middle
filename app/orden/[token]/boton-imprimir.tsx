"use client";

import { Printer } from "lucide-react";

// Único pedazo interactivo de /orden/[token]: el resto de la página es un
// Server Component. window.print() no corre en servidor, por eso este botón
// necesita su propio "use client".
export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-900 print:hidden"
    >
      <Printer className="h-[18px] w-[18px]" />
      Descargar o imprimir comprobante
    </button>
  );
}
