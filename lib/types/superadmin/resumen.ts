export type VencimientoProximo = {
  codTaller: number;
  nombreTal: string;
  telefonoTal?: string | null;
  fechaFinSuscTal?: string | null;
  diasRestantes?: number | null;
};

export type ResumenPlataforma = {
  mrr: number;
  talleresPorEstado: Record<string, number>;
  cuposFundadorRestantes: number;
  totalTalleres: number;
  conversionPruebaPago: number; // 0..1
  vencimientosProximos: VencimientoProximo[];
};
