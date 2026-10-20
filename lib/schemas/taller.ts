import { z } from "zod";

export const tallerConfigSchema = z.object({
  modoManoObra: z.enum(["HORAS", "LIBRE"]),
  tarifaHoraPred: z.coerce
    .number()
    .int("La tarifa debe ser un número entero")
    .min(0, "La tarifa debe ser mayor o igual a 0"),
  telefonoTal: z.string().max(20, "Máximo 20 caracteres").nullable(),
  direccionTal: z.string().max(200, "Máximo 200 caracteres").nullable(),
  textoPieComprobante: z.string().max(300, "Máximo 300 caracteres").nullable(),
});

export type TallerConfigFormData = z.infer<typeof tallerConfigSchema>;
