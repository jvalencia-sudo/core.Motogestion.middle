"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { aprobarCotizacionPublica } from "../actions";

interface Props {
  token: string;
  totalFormateado: string;
  whatsappHref?: string | null;
}

// F2-03: único bloque interactivo nuevo de esta tanda (aparte del botón de
// imprimir). Tras aprobar, router.refresh() vuelve a pedir el estado al
// servidor -- así la constancia (fecha/hora real) viene siempre del
// backend, nunca inventada en el cliente.
export function AprobarCotizacion({ token, totalFormateado, whatsappHref }: Readonly<Props>) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();

  async function confirmar() {
    setEnviando(true);
    setError(undefined);
    const { data, error: err } = await aprobarCotizacionPublica(token);
    setEnviando(false);
    if (err || !data) {
      setError(err || "No se pudo aprobar. Intenta de nuevo.");
      return;
    }
    setConfirmando(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2.5">
      {confirmando ? (
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm text-gray-700">¿Apruebas la cotización por {totalFormateado}?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="h-11 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando}
              className="h-11 rounded-lg bg-blue-600 text-sm font-bold text-white disabled:opacity-60"
            >
              {enviando ? "Aprobando..." : "Confirmar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-base font-bold text-white"
        >
          Aprobar cotización
        </button>
      )}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border-2 border-[#15803D] bg-white text-sm font-bold text-[#15803D]"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          Tengo dudas, escribir por WhatsApp
        </a>
      )}
      <p className="text-center text-[12px] text-gray-500">
        Al aprobar, guardamos la fecha y hora como constancia.
      </p>
      {error && <p className="text-center text-[13px] text-red-600">{error}</p>}
    </div>
  );
}
