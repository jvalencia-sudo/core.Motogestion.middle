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
  // F1-09: personalización visual de la orden.
  nombreComercialTal: z.string().max(150, "Máximo 150 caracteres").nullable(),
  whatsappTal: z.string().max(20, "Máximo 20 caracteres").nullable(),
  colorPrincipalTal: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal (ej. #00B06E)"),
  textoCondicionesTal: z.string().max(1500, "Máximo 1500 caracteres").nullable(),
  textoPieTal: z.string().max(200, "Máximo 200 caracteres").nullable(),
  mostrarPreciosUnitariosTal: z.boolean(),
  mostrarMecanicoTal: z.boolean(),
  mostrarFirmaClienteTal: z.boolean(),
  mostrarDetallePublicoTal: z.boolean(),
  horarioAtencionTal: z.string().max(300, "Máximo 300 caracteres").nullable(),
  exigirAprobacionCotizacionTal: z.boolean(),
});

export type TallerConfigFormData = z.infer<typeof tallerConfigSchema>;
