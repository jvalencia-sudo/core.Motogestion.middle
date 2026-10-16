"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NotaTaller } from "@/lib/types/superadmin/taller";
import { crearNota } from "../../actions";

export default function NotasTaller({
  codTaller,
  notas,
}: {
  codTaller: number;
  notas: NotaTaller[];
}) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string>();
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  async function agregar() {
    setGuardando(true);
    setError(undefined);
    const resp = await crearNota(codTaller, { texto });
    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    setTexto("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {notas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay notas para este taller.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notas.map((nota) => (
            <li key={nota.id} className="rounded-md border p-3 text-sm">
              <p>{nota.texto}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {nota.autor} · {nota.fecha}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Agregar una nota interna..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <Button size="sm" onClick={agregar} disabled={guardando || !texto.trim()}>
            {guardando ? "Guardando..." : "Agregar nota"}
          </Button>
        </div>
      </div>
    </div>
  );
}
