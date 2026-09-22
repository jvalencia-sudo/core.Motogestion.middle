"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Receipt } from "lucide-react";
import { generarPdfOrdenTrabajo, generarFacturaPdfOrdenTrabajo } from "../actions";

interface GenerarPdfButtonProps {
  consecutivo: number;
  tipo?: "orden" | "factura";
  label?: string;
}

export function GenerarPdfButton({
  consecutivo,
  tipo = "orden",
  label
}: GenerarPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleGenerarPdf = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const { pdfUrl } = tipo === "factura"
        ? await generarFacturaPdfOrdenTrabajo(consecutivo)
        : await generarPdfOrdenTrabajo(consecutivo);

      // Ruta propia del front (/api/...), no la URL directa del backend: así
      // pasa por el middleware, que adjunta el token de la sesión. Ver F0-01.
      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Error generando PDF:", err);
      setError("Error al generar el PDF. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = label || (tipo === "factura" ? "Generar Factura" : "Generar Orden");
  const Icon = tipo === "factura" ? Receipt : FileText;
  const buttonColor = tipo === "factura" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700";

  return (
    <div>
      <Button
        variant="default"
        className={buttonColor}
        onClick={handleGenerarPdf}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Icon className="mr-2 h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
