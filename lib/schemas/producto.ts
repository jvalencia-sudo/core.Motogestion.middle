import { z } from "zod";

/**
 * Schema para impuesto (camelCase)
 */
export const impuestoSchema = z.object({
  codImp: z.number(),
  porcentaje: z.number().min(0).max(100),
});

/**
 * Schema para crear un nuevo producto (camelCase)
 */
export const createProductoSchema = z
  .object({
    nombrePro: z
      .string()
      .min(1, "El nombre del producto es requerido")
      .max(70, "El nombre no puede exceder 70 caracteres"),
    descripcionPro: z
      .string()
      .min(1, "La descripción es requerida")
      .max(500, "La descripción no puede exceder 500 caracteres"),
    precioPro: z.coerce
      .number()
      .min(0, "El precio debe ser mayor o igual a 0"),
    stockPro: z.coerce
      .number()
      .int("El stock debe ser un número entero")
      .min(0, "El stock debe ser mayor o igual a 0"),
    stockProMin: z.coerce
      .number()
      .int("El stock mínimo debe ser un número entero")
      .min(0, "El stock mínimo debe ser mayor o igual a 0"),
    impuestos: z.array(impuestoSchema).optional(),
  })
  .refine((data) => data.stockPro >= data.stockProMin, {
    message: "El stock actual no puede ser menor que el stock mínimo",
    path: ["stockPro"],
  });

/**
 * Schema para actualizar un producto existente (camelCase)
 */
export const updateProductoSchema = z
  .object({
    nombrePro: z
      .string()
      .min(1, "El nombre del producto es requerido")
      .max(70, "El nombre no puede exceder 70 caracteres")
      .optional(),
    descripcionPro: z
      .string()
      .max(500, "La descripción no puede exceder 500 caracteres")
      .optional(),
    precioPro: z.coerce
      .number()
      .min(0, "El precio debe ser mayor o igual a 0")
      .optional(),
    stockPro: z.coerce
      .number()
      .int("El stock debe ser un número entero")
      .min(0, "El stock debe ser mayor o igual a 0")
      .optional(),
    stockProMin: z.coerce
      .number()
      .int("El stock mínimo debe ser un número entero")
      .min(0, "El stock mínimo debe ser mayor o igual a 0")
      .optional(),
    impuestos: z.array(impuestoSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.stockPro !== undefined && data.stockProMin !== undefined) {
        return data.stockPro >= data.stockProMin;
      }
      return true;
    },
    {
      message: "El stock actual no puede ser menor que el stock mínimo",
      path: ["stockPro"],
    }
  );

export type CreateProductoFormData = z.infer<typeof createProductoSchema>;
export type UpdateProductoFormData = z.infer<typeof updateProductoSchema>;
