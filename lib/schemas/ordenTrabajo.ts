import { z } from "zod";

/**
 * Schema para detalle de orden (producto)
 * Frontend usa camelCase, backend Python usa snake_case
 */
export const detalleOrdenSchema = z.object({
  codProDeto: z.number().int().positive("Debe seleccionar un producto"),
  valorUnitarioDeto: z.coerce
    .number()
    .positive("El valor debe ser mayor a 0")
    .optional(),
  cantidadDeto: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0")
    .max(99, "La cantidad no puede exceder 99"),
});

/**
 * Schema para crear una nueva orden de trabajo
 * Frontend usa camelCase, backend Python usa snake_case
 */
export const createOrdenTrabajoSchema = z.object({
  placaMotOt: z
    .string()
    .min(1, "Debe seleccionar una moto")
    .max(6, "La placa no puede exceder 6 caracteres"),
  kilometrajeIngresoOt: z.coerce
    .number()
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje no puede ser negativo")
    .max(999999, "El kilometraje no puede exceder 999,999 km"),
  documentoUsuRpOt: z
    .string()
    .min(1, "Debe seleccionar un usuario responsable"),
  documentoUsuMcOt: z
    .string()
    .min(1, "Debe seleccionar un mecánico"),
  observacionCliOt: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres")
    .optional(),
  observacionOt: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres")
    .optional(),
  fechaElaboracionOt: z.string().min(1, "La fecha de elaboración es requerida"),
  fechaEntregaOt: z.string().optional(),
  fechaFinGarantiaOt: z.string().optional().refine(
    (date) => {
      if (!date) return true; // Si no hay fecha, es válido (opcional)
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 30);
      return selectedDate >= minDate;
    },
    { message: "La garantía debe ser al menos 30 días desde hoy" }
  ),
  codOtEstOt: z.number().int().positive("Debe seleccionar un estado").optional(),
  detalles: z
    .array(detalleOrdenSchema)
    .min(1, "Debe agregar al menos un producto a la orden"),
});

/**
 * Schema para actualizar una orden de trabajo existente
 */
export const updateOrdenTrabajoSchema = z.object({
  documentoUsuRpOt: z.string().optional(),
  documentoUsuMcOt: z.string().optional(),
  fechaEntregaOt: z.string().optional(),
  observacionOt: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres")
    .optional(),
  codOtEstOt: z.number().int().positive("Debe seleccionar un estado").optional(),
  fechaFinGarantiaOt: z.string().optional(),
  observacionCliOt: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres")
    .optional(),
});

export type CreateOrdenTrabajoFormData = z.infer<typeof createOrdenTrabajoSchema>;
export type UpdateOrdenTrabajoFormData = z.infer<typeof updateOrdenTrabajoSchema>;
export type DetalleOrdenFormData = z.infer<typeof detalleOrdenSchema>;
