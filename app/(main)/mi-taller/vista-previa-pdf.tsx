"use client";

import { useEffect, useRef, useState } from "react";
import { Control, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { TallerConfigFormData } from "@/lib/schemas/taller";

const DEBOUNCE_MS = 600;

export function VistaPreviaPdf({ control }: { control: Control<TallerConfigFormData> }) {
  const valores = useWatch({
    control,
    name: [
      "nombreComercialTal",
      "colorPrincipalTal",
      "textoCondicionesTal",
      "textoPieTal",
      "mostrarPreciosUnitariosTal",
      "mostrarMecanicoTal",
      "mostrarFirmaClienteTal",
    ],
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setCargando(true);
      try {
        const [
          nombreComercialTal,
          colorPrincipalTal,
          textoCondicionesTal,
          textoPieTal,
          mostrarPreciosUnitariosTal,
          mostrarMecanicoTal,
          mostrarFirmaClienteTal,
        ] = valores;
        const resp = await fetch("/api/talleres/vista-previa-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreComercialTal,
            colorPrincipalTal,
            textoCondicionesTal,
            textoPieTal,
            mostrarPreciosUnitariosTal,
            mostrarMecanicoTal,
            mostrarFirmaClienteTal,
          }),
          signal: controller.signal,
        });
        if (!resp.ok) return;
        const blob = await resp.blob();
        setPdfUrl((anterior) => {
          if (anterior) URL.revokeObjectURL(anterior);
          return URL.createObjectURL(blob);
        });
      } catch {
        // Petición cancelada por un cambio más reciente, o error de red: no hacer nada.
      } finally {
        setCargando(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(valores)]);

  return (
    <div className="relative border rounded min-h-[500px] bg-muted/20">
      {cargando && (
        <div className="absolute top-2 right-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      {pdfUrl ? (
        <iframe title="Vista previa de la orden" src={pdfUrl} className="w-full h-[700px] rounded" />
      ) : (
        <div className="flex items-center justify-center h-[500px] text-sm text-muted-foreground">
          Generando vista previa...
        </div>
      )}
    </div>
  );
}
