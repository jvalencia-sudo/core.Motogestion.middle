import { z } from "zod";

// Schema para crear nuevo reclamo
export const createReclamoSchema = z.object({
  descripcionRec: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres")
    .trim(),
  consecutivoOtRec: z
    .number({ invalid_type_error: "Debe seleccionar una orden de trabajo" })
    .int("El número de orden debe ser un entero")
    .positive("El número de orden debe ser mayor a 0"),
});

// Schema para actualizar reclamo
export const updateReclamoSchema = z.object({
  descripcionRec: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres")
    .trim()
    .optional(),
});

// Tipos extraídos de los esquemas
export type CreateReclamoFormData = z.infer<typeof createReclamoSchema>;
export type UpdateReclamoFormData = z.infer<typeof updateReclamoSchema>;
