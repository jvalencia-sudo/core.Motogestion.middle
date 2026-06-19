import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer } from "@/lib/types/core/client";
import { UnitType } from "@/lib/types/operation/unit-type";
import RemoveButton from "@/components/remove-button";
import SectionSeparator from "@/components/section-separator";
import { CardContent } from "@/components/ui/card";
import { CirclePlus } from "lucide-react";
import { calculateNetWeight, handleNumericChange } from "@/lib/form-utils";
import { InternationalFormValues } from "@/lib/schemas/operation/operation-schemas";
import { Location } from "@/lib/types/core/location";
import { PALLET_UNIT_TYPE_ID } from "@/lib/constants/unit-type";

interface DestinationsFormProps {
  clients: Customer[];
  locations: Location[];
  unitTypes: UnitType[];
}

export function DestinationsForm({
  clients,
  locations,
  unitTypes,
}: DestinationsFormProps) {
  const { control, watch, setValue, formState } =
    useFormContext<InternationalFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "locations",
  });

  const handleAddUnit = (index: number) => {
    const units = watch(`locations.${index}.units`) || [];
    setValue(`locations.${index}.units`, [
      ...units,
      {
        unitTypeId: 0,
        unitCount: 0,
        unitWeight: 0.0,
        netWeight: 0.0,
        grossWeight: 0.0,
      },
    ]);
  };

  const handleRemoveUnit = (index: number, unitIndex: number) => {
    const units = watch(`locations.${index}.units`) || [];
    units.splice(unitIndex, 1);
    setValue(`locations.${index}.units`, units);
  };

  const calculateGrossWeight = (
    count: number,
    weight: number,
    unitTypeId: number,
  ) => {
    const unitType = unitTypes.find((type) => type.unitTypeId === unitTypeId);
    const unitWeight = unitType?.unitWeight || 0;
    return calculateNetWeight(count, weight) + unitWeight;
  };

  const updateWeights = (index: number, unitIndex: number) => {
    const count =
      Number(watch(`locations.${index}.units.${unitIndex}.unitCount`)) || 0;
    const weight =
      Number(watch(`locations.${index}.units.${unitIndex}.unitWeight`)) || 0;
    const type =
      Number(watch(`locations.${index}.units.${unitIndex}.unitTypeId`)) || 0;

    setValue(
      `locations.${index}.units.${unitIndex}.netWeight`,
      Number(calculateNetWeight(count, weight)),
    );
    setValue(
      `locations.${index}.units.${unitIndex}.grossWeight`,
      Number(calculateGrossWeight(count, weight, type)),
    );
  };

  const locationsError = formState.errors.locations;
  const defaultLocation = { client: 0, locationId: 0, units: [] };

  return (
    <div>
      <SectionSeparator title={"Destinations"} />
      {fields.map((field, index) => {
        const unitsError = formState.errors.locations?.[index]?.units;
        return (
          <div key={field.id} className="border-b pb-6 mb-6">
            <div className="grid grid-cols-[1fr,auto] gap-6 border-2 rounded-sm p-6">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`locations.${index}.client`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Select
                          required={true}
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem
                                key={client.customerId}
                                value={client.customerId.toString()}
                              >
                                {client.customerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${index}.locationId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            const selectedLocation = locations.find(
                              (loc) => loc.locationId.toString() === value,
                            );
                            if (selectedLocation) {
                              setValue(
                                `locations.${index}.address`,
                                selectedLocation.address,
                              );
                            }
                          }}
                          defaultValue=""
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location..." />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.length > 0 ? (
                              locations.map((loc) => (
                                <SelectItem
                                  key={loc.locationId}
                                  value={loc.locationId.toString()}
                                >
                                  {loc.location}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled value="no-location">
                                No locations available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={watch(`locations.${index}.address`) || ""}
                      disabled
                    />
                  </FormControl>
                </FormItem>
              </div>
              <div className="pl-6 flex flex-col justify-center pt-8">
                <RemoveButton onRemove={() => remove(index)} />
              </div>
            </div>

            <CardContent>
              {(watch(`locations.${index}.units`) || []).map(
                (_unit, unitIndex) => (
                  <div
                    key={unitIndex}
                    className="grid grid-cols-[1fr,auto] gap-6 border-2 rounded-sm p-6 mt-4"
                  >
                    <div className="grid grid-cols-5 gap-4">
                      <FormField
                        control={control}
                        name={`locations.${index}.units.${unitIndex}.unitTypeId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value?.toString() || ""}
                                onValueChange={(value) =>
                                  field.onChange(Number(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {unitTypes.map((type) => (
                                    <SelectItem
                                      key={type.unitTypeId}
                                      value={type.unitTypeId.toString()}
                                    >
                                      {type.unitTypeName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`locations.${index}.units.${unitIndex}.unitCount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) => {
                                  const value =
                                    parseInt(e.target.value, 10) || 0;
                                  field.onChange(value);
                                  updateWeights(index, unitIndex);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`locations.${index}.units.${unitIndex}.unitWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0.1}
                                step={0.1}
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(value);
                                  updateWeights(index, unitIndex);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`locations.${index}.units.${unitIndex}.netWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Net Weight</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0.1}
                                step={0.1}
                                disabled
                                {...field}
                                value={calculateNetWeight(
                                  watch(
                                    `locations.${index}.units.${unitIndex}.unitCount`,
                                  ) || 0,
                                  watch(
                                    `locations.${index}.units.${unitIndex}.unitWeight`,
                                  ) || 0,
                                ).toFixed(2)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`locations.${index}.units.${unitIndex}.grossWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gross Weight</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0.1}
                                step={0.1}
                                {...field}
                                disabled
                                value={calculateGrossWeight(
                                  watch(
                                    `locations.${index}.units.${unitIndex}.unitCount`,
                                  ) || 0,
                                  watch(
                                    `locations.${index}.units.${unitIndex}.unitWeight`,
                                  ) || 0,
                                  watch(
                                    `locations.${index}.units.${unitIndex}.unitTypeId`,
                                  ) || 0,
                                ).toFixed(2)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watch(
                        `locations.${index}.units.${unitIndex}.unitTypeId`,
                      ) === PALLET_UNIT_TYPE_ID && (
                        <>
                          <FormField
                            control={control}
                            name={`locations.${index}.units.${unitIndex}.height`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    {...field}
                                    value={field.value || 0}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        field.onChange,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`locations.${index}.units.${unitIndex}.width`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Width</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    {...field}
                                    value={field.value || 0}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        field.onChange,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`locations.${index}.units.${unitIndex}.length`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Length</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    {...field}
                                    value={field.value || 0}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        field.onChange,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                    <div className="pl-6 flex flex-col justify-center pt-8">
                      <RemoveButton
                        onRemove={() => handleRemoveUnit(index, unitIndex)}
                      />
                    </div>
                  </div>
                ),
              )}

              {unitsError && watch(`locations.${index}.units`)?.length < 1 && (
                <div className="text-red-500 text-sm mt-2">
                  {unitsError.message}{" "}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="dashed"
                  onClick={() => handleAddUnit(index)}
                >
                  Add Unit
                  <CirclePlus />
                </Button>
              </div>
            </CardContent>
          </div>
        );
      })}

      {locationsError && (
        <div className="text-red-500 text-sm mt-2">
          {locationsError.message}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="dashed"
          type="button"
          onClick={() => {
            append(defaultLocation);
          }}
        >
          Add Destination
          <CirclePlus />
        </Button>
      </div>
    </div>
  );
}
