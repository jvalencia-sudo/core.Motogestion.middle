import { z } from "zod";

export const registrarPagoSchema = z.object({
  valorPago: z.coerce
    .number()
    .positive("El valor debe ser mayor a 0"),
  metodoPago: z.enum([
    "EFECTIVO",
    "TRANSFERENCIA",
    "NEQUI",
    "DAVIPLATA",
    "TARJETA",
    "OTRO",
  ]),
  referenciaPago: z.string().max(80, "Máximo 80 caracteres").optional(),
});

export const anularPagoSchema = z.object({
  motivo: z
    .string()
    .min(5, "El motivo debe tener al menos 5 caracteres")
    .max(500, "Máximo 500 caracteres"),
});

export type RegistrarPagoFormData = z.infer<typeof registrarPagoSchema>;
export type AnularPagoFormData = z.infer<typeof anularPagoSchema>;
