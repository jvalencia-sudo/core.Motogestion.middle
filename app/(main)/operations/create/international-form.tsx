import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Incoterm } from "@/lib/types/core/incoterm";
import { OperationType } from "@/lib/types/operation/operation-type";
import { HazardType } from "@/lib/types/core/hazard-type";
import MultiSelect from "@/components/multi-select";
import { VehicleType } from "@/lib/types/core/vehicle-type";
import { InternationalFormValues } from "@/lib/schemas/operation/operation-schemas";
import { Location } from "@/lib/types/core/location";
import { LAND_OPERATION_TYPE_ID } from "@/lib/constants/operation-scope";

interface InternationalFormProps {
  incoterms: Incoterm[];
  operationTypes: OperationType[];
  hazardTypes: HazardType[];
  locations: Location[];
  vehicleTypes: VehicleType[];
}

export function InternationalForm({
  incoterms,
  operationTypes,
  hazardTypes,
  locations,
  vehicleTypes,
}: InternationalFormProps) {
  const { control, watch, setValue } =
    useFormContext<InternationalFormValues>();
  return (
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={control}
        name="validityDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Validity Date</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onChange={(date) => field.onChange(date || undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="incotermIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Incoterms</FormLabel>
            <div className="flex gap-4 items-center">
              <FormControl>
                <MultiSelect
                  options={incoterms}
                  labelKey="incotermCode"
                  valueKey="incotermId"
                  selectedValues={field.value ?? []}
                  onChange={field.onChange}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="operationTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operation Type</FormLabel>
            <FormControl>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operation type..." />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map((type) => (
                    <SelectItem
                      key={type.operationTypeId}
                      value={type.operationTypeId.toString()}
                    >
                      {type.operationTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {watch(`operationTypeId`) === LAND_OPERATION_TYPE_ID && (
        <div>
          <FormField
            control={control}
            name="vehicleTypeIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
                <div className="flex gap-4 items-center">
                  <FormControl>
                    <MultiSelect
                      options={vehicleTypes}
                      labelKey="vehicleTypeName"
                      valueKey="vehicleTypeId"
                      selectedValues={field.value ?? []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={control}
        name="serviceTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Type</FormLabel>
            <FormControl>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Expreso</SelectItem>
                  <SelectItem value="2">Consolidado</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="loadDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Load Date</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onChange={(date) => field.onChange(date || undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isHazardInternational"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dangerous Goods</FormLabel>
            <div className="flex gap-4 items-center">
              <FormControl>
                <div className="scale-125 py-1.5 ml-1.5">
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {watch("isHazardInternational") && (
        <FormField
          control={control}
          name="hazardTypeIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hazard Type</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <MultiSelect
                    options={hazardTypes}
                    labelKey="hazardTypeName"
                    valueKey="hazardTypeId"
                    selectedValues={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="locationOriginId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Origin</FormLabel>
            <FormControl>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => {
                  field.onChange(Number(value));
                  const selectedLocation = locations.find(
                    (loc) => loc.locationId.toString() === value,
                  );
                  if (selectedLocation) {
                    setValue("originAddress", selectedLocation.address);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem
                      key={loc.locationId}
                      value={loc.locationId.toString()}
                    >
                      {loc.location}
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
        name="originAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Origin Address</FormLabel>
            <FormControl>
              <Input type="text" disabled value={field.value || ""} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="observation"
        render={({ field }) => (
          <FormItem className="col-span-3">
            <FormLabel>Comments</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add your comments"
                value={field.value || ""}
                onChange={field.onChange}
                className="min-h-[60px] resize-none col-end-2" // Doubled the height
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
