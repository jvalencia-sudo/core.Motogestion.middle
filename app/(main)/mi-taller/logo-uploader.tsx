"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

export function LogoUploader({ tieneLogo }: { tieneLogo: boolean }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  async function cargarLogoActual() {
    try {
      const resp = await fetch("/api/talleres/logo", { cache: "no-store" });
      if (!resp.ok) {
        setLogoUrl(null);
        return;
      }
      const blob = await resp.blob();
      setLogoUrl((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return URL.createObjectURL(blob);
      });
    } catch {
      setLogoUrl(null);
    }
  }

  useEffect(() => {
    if (tieneLogo) cargarLogoActual();
    // Solo al montar: el logo no cambia desde afuera de este componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFile(file: File) {
    setError(undefined);
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Formato no soportado. Usa PNG, JPG o WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("El archivo supera el máximo de 2MB.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/talleres/logo", { method: "POST", body: formData });
      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        setError(data?.detail || "No se pudo subir el logo.");
        return;
      }
      await cargarLogoActual();
    } catch {
      setError("Ocurrió un error inesperado subiendo el logo.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded border bg-muted/30 overflow-hidden">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo del taller" className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground text-center px-1">Sin logo</span>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {logoUrl ? "Cambiar logo" : "Subir logo"}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG o WebP, máx. 2MB.</p>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
}
