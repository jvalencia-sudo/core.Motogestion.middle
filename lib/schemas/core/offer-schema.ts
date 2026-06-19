import { z } from "zod";

export const internationalQuotationItemSchema = z
  .object({
    incotermId: z.number().min(1, "Value required"),
    validUntil: z.date().optional(),
    transporter: z.string().min(1, "This field is required"),
    transitTime: z.number().min(1, "Value required"),
    transshipment: z.boolean(),
    freeDays: z.number().min(1, "Value required"),
    tariff: z.number().min(1, "Value required"),
    currencyId: z.number().min(1, "Value required"),
    currencyName: z.string().min(1, "This field is required"),
    observation: z.string().optional(),
    loadType: z.string().min(1, "This field is required"),
    amount: z.number().min(1, "Value required"),
    min: z.number().optional(),
    wm: z.number().optional(),
    containerSize20: z.number().optional(),
    containerSize40: z.number().optional(),
    imo: z.number().min(1, "Value required"),
    freightPercentage: z.number().min(1, "Value required"),
    documentBl: z.number().min(1, "Value required"),
    preparationFeeBl: z.number().min(1, "Value required"),
    mountingDismounting: z.number().min(1, "Value required"),
    foodGrade: z.number().min(1, "Value required"),
    positioning: z.number().min(1, "Value required"),
    thcOrigin: z.number().min(1, "Value required"),
    specialHandling: z.number().min(1, "Value required"),
    vgm: z.number().min(1, "Value required"),
    customAms: z.number().min(1, "Value required"),
    consolidationLcl: z.number().min(1, "Value required"),
    destinationBl: z.number().min(1, "Value required"),
    destinationCont: z.number().min(1, "Value required"),
    freeDaysDestination: z.number().min(1, "Value required"),
  })
  .superRefine((data, ctx) => {
    if (data.validUntil === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validUntil"],
        message: "This field is required.",
      });
    }
    if (data.loadType === "LCL") {
      if (data.min === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["min"],
          message: "This field is required.",
        });
      }
      if (data.wm === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["wm"],
          message: "This field is required.",
        });
      }
    }
    if (data.loadType === "FCL") {
      if (data.containerSize20 === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["containerSize20"],
          message: "This field is required.",
        });
      }
      if (data.containerSize40 === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["containerSize40"],
          message: "This field is required.",
        });
      }
    }
  });

export const nationalQuotationItemSchema = z.object({
  validUntil: z.date(),
  freeLoading: z.boolean(),
  availabilityRequestedDate: z.boolean(),
  loadingDate: z.date(),
  locations: z.array(
    z.object({
      locationId: z.number(),
      locationName: z.string(),
      address: z.string(),
      tariff: z.number().min(0, "La tarifa debe ser mayor a 0"),
    }),
  ),
  totalTariff: z.number().optional(),
  currencyId: z.number().min(1, "Campo requerido"),
  currencyName: z.string().min(1, "Campo requerido"),
  observation: z.string().optional(),
});

export const internationalQuotationSchema = z.object({
  locations: z
    .array(
      z.object({
        locationId: z.number().min(1, "This field is required."),
        locationName: z.string(),
        address: z.string().min(1, "This field is required."),
        quotations: z
          .array(internationalQuotationItemSchema)
          .min(1, "At least one quotation is required."),
      }),
    )
    .min(1, "At least one location is required."),
});

export const nationalQuotationSchema = z.object({
  quotations: z
    .array(nationalQuotationItemSchema)
    .min(1, "At least one quotation is required"),
});

export type InternationalQuotationFormValues = z.infer<
  typeof internationalQuotationSchema
>;
export type NationalQuotationFormValues = z.infer<
  typeof nationalQuotationSchema
>;
