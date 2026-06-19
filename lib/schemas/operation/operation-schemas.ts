import { z } from "zod";
import { LAND_OPERATION_TYPE_ID } from "@/lib/constants/operation-scope";
import { PALLET_UNIT_TYPE_ID } from "@/lib/constants/unit-type";
const baseSchema = z.object({
  loadDate: z.date(),
  locationOriginId: z.number(),
  serviceTypeId: z.number(),
  originAddress: z.string().optional(),
  observation: z.string().optional(),
  validityDate: z.date(),
  locations: z
    .array(
      z.object({
        client: z.number().min(1, { message: "Required" }),
        locationId: z.number().min(1, { message: "Required" }),
        address: z.string().optional(),
        units: z
          .array(
            z
              .object({
                unitTypeId: z.number().min(1, { message: "Required" }),
                unitCount: z
                  .number()
                  .min(1, { message: "Value must be greater than 0" }),
                unitWeight: z
                  .number()
                  .min(0.1, { message: "Value must be greater than 0" }),
                netWeight: z.number(),
                grossWeight: z.number(),
                length: z.number().optional(),
                height: z.number().optional(),
                width: z.number().optional(),
              })
              .superRefine((data, ctx) => {
                if (data.unitTypeId === PALLET_UNIT_TYPE_ID) {
                  if (data.length === undefined) {
                    ctx.addIssue({
                      path: ["length"],
                      code: "custom",
                      message: "Required",
                    });
                  }
                  if (data.height === undefined) {
                    ctx.addIssue({
                      path: ["height"],
                      code: "custom",
                      message: "Required",
                    });
                  }
                  if (data.width === undefined) {
                    ctx.addIssue({
                      path: ["width"],
                      code: "custom",
                      message: "Required",
                    });
                  }
                }
              }),
          )
          .min(1, "At least one unit is required"),
      }),
    )
    .min(1, "At least one location is required"),
});

//Schema national
export const nationalOperationSchema = baseSchema
  .extend({
    vehicleTypeIds: z.array(z.number()).nonempty("Vehicle Type is required."),
    loadHour: z.string(),
    isHazard: z.boolean().optional(),
    hazardTypeIds: z.array(z.number()).optional(),
    requiresEscort: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.isHazard === true &&
      (!data.hazardTypeIds || data.hazardTypeIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required.",
        path: ["hazardTypeIds"],
      });
    }
  });

//Schema international
export const internationalOperationSchema = baseSchema
  .extend({
    incotermIds: z.array(z.number()).nonempty("Incoterms are required."),
    vehicleTypeIds: z.array(z.number()).optional(),
    operationTypeId: z.number(),
    isHazardInternational: z.boolean().optional(),
    hazardTypeIds: z.array(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.isHazardInternational === true &&
      (!data.hazardTypeIds || data.hazardTypeIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required.",
        path: ["hazardTypeIds"],
      });
    }
    if (data.operationTypeId === LAND_OPERATION_TYPE_ID) {
      if (!data.vehicleTypeIds || data.vehicleTypeIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required.",
          path: ["vehicleTypeIds"],
        });
      }
    }
  });

//Types
export type NationalFormValues = z.infer<typeof nationalOperationSchema>;
export type InternationalFormValues = z.infer<
  typeof internationalOperationSchema
>;
export type FormValues = NationalFormValues & InternationalFormValues;
