"use client";

import { Badge } from "@/components/ui/badge";
import { Impuesto } from "@/lib/types/producto";

interface ImpuestosCellProps {
  impuestos: Impuesto[];
}

export function ImpuestosCell({ impuestos }: ImpuestosCellProps) {
  if (!impuestos || impuestos.length === 0) {
    return <span>-</span>;
  }

  // Debug: verificar si hay codImp duplicados
  const codigos = impuestos.map(imp => imp.codImp);
  const duplicados = codigos.filter((cod, index) => codigos.indexOf(cod) !== index);

  if (duplicados.length > 0) {
    console.warn("⚠️ IMPUESTOS DUPLICADOS DETECTADOS:", {
      duplicados: [...new Set(duplicados)],
      impuestos: impuestos
    });
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {impuestos.map((imp, index) => (
        <Badge
          key={`${imp.codImp}-${imp.porcentaje}-${index}`}
          variant="outline"
          className="text-xs"
        >
          {imp.nombreImp} {imp.porcentaje}%
        </Badge>
      ))}
    </div>
  );
}
