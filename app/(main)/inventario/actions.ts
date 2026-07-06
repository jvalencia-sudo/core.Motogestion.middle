"use server";

import { appFetch } from "@/lib/fetch";
import { MovimientoInventario, ProductoStock } from "@/lib/types/inventario";

export async function getMovimientos(
  producto?: number,
): Promise<MovimientoInventario[]> {
  const q = producto ? `?producto=${producto}` : "";
  const { data } = await appFetch<MovimientoInventario[]>(
    `/api/inventario/movimientos${q}`,
  );
  return data ?? [];
}

export async function getProductosStock(): Promise<ProductoStock[]> {
  const { data } = await appFetch<ProductoStock[]>("/api/inventario/productos");
  return data ?? [];
}

export async function registrarEntrada(
  codPro: number,
  cantidad: number,
  motivo?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await appFetch("/api/inventario/entrada", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codPro, cantidad, motivo }),
  });
  return { ok: !error, error: error ?? undefined };
}

export async function aplicarTomaFisica(
  items: { codPro: number; cantidadFisica: number }[],
  motivo?: string,
): Promise<{ ok: boolean; error?: string; ajustados: number }> {
  const { data, error } = await appFetch<{ ajustados: number }>(
    "/api/inventario/toma-fisica",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, motivo }),
    },
  );
  return { ok: !error, error: error ?? undefined, ajustados: data?.ajustados ?? 0 };
}
