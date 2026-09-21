import { z } from "zod";

export const tallerConfigSchema = z.object({
  modoManoObra: z.enum(["HORAS", "LIBRE"]),
  tarifaHoraPred: z.coerce
    .number()
    .int("La tarifa debe ser un número entero")
    .min(0, "La tarifa debe ser mayor o igual a 0"),
});

export type TallerConfigFormData = z.infer<typeof tallerConfigSchema>;
