"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link2, RefreshCw, Check } from "lucide-react";
import { regenerarTokenPublicoOrden } from "../actions";

interface LinkPublicoDialogProps {
  consecutivo: number;
  tokenPublico: string;
}

export function LinkPublicoDialog({ consecutivo, tokenPublico }: LinkPublicoDialogProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(tokenPublico);
  const [copiado, setCopiado] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [error, setError] = useState<string>();
  // window.location solo existe en el navegador -- se calcula después de
  // montar para no desalinear el render del servidor con el del cliente.
  const [origen, setOrigen] = useState("");

  useEffect(() => {
    setOrigen(window.location.origin);
  }, []);

  const url = origen ? `${origen}/orden/${token}` : "";

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function regenerar() {
    setRegenerando(true);
    setError(undefined);
    const resp = await regenerarTokenPublicoOrden(consecutivo);
    setRegenerando(false);
    if (resp.error || !resp.data) {
      setError(resp.error ?? "No se pudo regenerar el link");
      return;
    }
    setToken(resp.data.tokenPublico);
    setCopiado(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Link2 className="mr-2 h-4 w-4" />
        Link público
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link público de estado</DialogTitle>
            <DialogDescription>
              Envíaselo al cliente por WhatsApp para que vea el estado de su moto sin
              necesidad de iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input value={url} readOnly className="font-mono text-xs" />
              <Button type="button" variant="outline" onClick={copiar}>
                {copiado ? <Check className="h-4 w-4" /> : "Copiar"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={regenerar}
              disabled={regenerando}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${regenerando ? "animate-spin" : ""}`} />
              {regenerando ? "Regenerando..." : "Regenerar link (invalida el anterior)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
