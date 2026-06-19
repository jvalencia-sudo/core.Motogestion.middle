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
import RemoveButton from "@/components/remove-button";
import SectionSeparator from "@/components/section-separator";
import { CirclePlus } from "lucide-react";
import { Incoterm } from "@/lib/types/core/incoterm";
import { Currency } from "@/lib/types/operation/currency";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { handleNumericChange } from "@/lib/form-utils";
import { InternationalQuotationFormValues } from "@/lib/schemas/core/offer-schema";

type QuotationFormProps = {
  incoterms: Incoterm[];
  currencies: Currency[];
  indexLocation: number;
};

export function InternationalQuotationForm({
  incoterms,
  currencies,
  indexLocation,
}: QuotationFormProps) {
  const { control, watch, setValue } =
    useFormContext<InternationalQuotationFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `locations.${indexLocation}.quotations`,
  });
  const LOAD_TYPE_LCL = "LCL";
  const LOAD_TYPE_FCL = "FCL";
  const defaultQuotation = {
    incotermId: 0,
    validUntil: undefined,
    transporter: "",
    transitTime: 0,
    transshipment: false,
    freeDays: 0,
    tariff: 0,
    currencyId: 0,
    currencyName: "",
    loadType: "",
    imo: 0,
    freightPercentage: 0,
    documentBl: 0,
    preparationFeeBl: 0,
    mountingDismounting: 0,
    foodGrade: 0,
    positioning: 0,
    thcOrigin: 0,
    specialHandling: 0,
    vgm: 0,
    customAms: 0,
    consolidationLcl: 0,
    destinationBl: 0,
    destinationCont: 0,
    freeDaysDestination: 0,
    amount: 0,
  };

  return (
    <CardContent>
      <SectionSeparator title="Quotations" />
      {fields.map((field, index) => (
        <div key={field.id} className="mb-4">
          <Card className="grid grid-cols-[1fr,auto] gap-4">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.incotermId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incoterm</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select incoterm..." />
                          </SelectTrigger>
                          <SelectContent>
                            {incoterms.map((incoterm) => (
                              <SelectItem
                                key={incoterm.incotermId}
                                value={incoterm.incotermId.toString()}
                              >
                                {incoterm.incotermCode}
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
                  name={`locations.${indexLocation}.quotations.${index}.validUntil`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ?? undefined}
                          onChange={(date) => field.onChange(date || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.transporter`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transporter</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter transporter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.transitTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transit Time (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter transit time"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.transshipment`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transhipment</FormLabel>
                      <div className="flex gap-4 items-center">
                        <FormControl>
                          <div className="scale-125 py-1.5 ml-1.5">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.freeDays`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter free days"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.tariff`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tariff</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter tariff"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.currencyId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            const selectedCurrency = currencies.find(
                              (curr) => curr.currencyId.toString() === value,
                            );
                            if (selectedCurrency) {
                              setValue(
                                `locations.${indexLocation}.quotations.${index}.currencyName`,
                                selectedCurrency.currencyName,
                              );
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem
                                key={currency.currencyId}
                                value={currency.currencyId.toString()}
                              >
                                {currency.currencyName}
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
                  name={`locations.${indexLocation}.quotations.${index}.loadType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Load Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select load type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FCL">FCL</SelectItem>
                            <SelectItem value="LCL">LCL</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watch(
                  `locations.${indexLocation}.quotations.${index}.loadType`,
                ) === LOAD_TYPE_LCL && (
                  <>
                    <FormField
                      control={control}
                      name={`locations.${indexLocation}.quotations.${index}.min`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Weight</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Enter minimum weight"
                              onChange={(e) =>
                                handleNumericChange(
                                  field.onChange,
                                  e.target.value,
                                )
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`locations.${indexLocation}.quotations.${index}.wm`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>W/M</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Enter W/M"
                              onChange={(e) =>
                                handleNumericChange(
                                  field.onChange,
                                  e.target.value,
                                )
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {watch(
                  `locations.${indexLocation}.quotations.${index}.loadType`,
                ) === LOAD_TYPE_FCL && (
                  <>
                    <FormField
                      control={control}
                      name={`locations.${indexLocation}.quotations.${index}.containerSize20`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>20' Container</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Enter 20' container rate"
                              onChange={(e) =>
                                handleNumericChange(
                                  field.onChange,
                                  e.target.value,
                                )
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`locations.${indexLocation}.quotations.${index}.containerSize40`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>40' Container</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Enter 40' container rate"
                              onChange={(e) =>
                                handleNumericChange(
                                  field.onChange,
                                  e.target.value,
                                )
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {(watch(
                  `locations.${indexLocation}.quotations.${index}.loadType`,
                ) === LOAD_TYPE_FCL ||
                  watch(
                    `locations.${indexLocation}.quotations.${index}.loadType`,
                  ) === LOAD_TYPE_LCL) && (
                  <FormField
                    control={control}
                    name={`locations.${indexLocation}.quotations.${index}.imo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Enter imo"
                            onChange={(e) =>
                              handleNumericChange(
                                field.onChange,
                                e.target.value,
                              )
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter amount"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.freightPercentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Flete</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter imo"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.documentBl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document BL</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter document BL charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.preparationFeeBl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BL Preparation Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter BL preparation fee"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.mountingDismounting`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mounting/Dismounting</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter mounting/dismounting charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.foodGrade`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Grade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter food grade charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.positioning`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positioning</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter positioning charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.thcOrigin`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>THC Origin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter THC origin charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.specialHandling`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Handling</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter special handling charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.vgm`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VGM</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter VGM charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.customAms`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom (AMS)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter custom AMS charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.consolidationLcl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consolidation (LCL)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter consolidation LCL charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.destinationBl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination BL</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter destination BL charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.destinationCont`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Cont</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter destination cont charge"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.freeDaysDestination`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Days Destination</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Enter free days at destination"
                          onChange={(e) =>
                            handleNumericChange(field.onChange, e.target.value)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`locations.${indexLocation}.quotations.${index}.observation`}
                  render={({ field }) => (
                    <FormItem className="col-span-full">
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
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="hidden"
                    value={
                      watch(
                        `locations.${indexLocation}.quotations.${index}.currencyName`,
                      ) || ""
                    }
                    disabled
                  />
                </FormControl>
              </FormItem>
            </CardContent>
            <div className="flex flex-col justify-center items-center pr-1">
              <RemoveButton onRemove={() => remove(index)} />
            </div>
          </Card>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="dashed"
          onClick={() => append(defaultQuotation)}
        >
          Add Quotation
          <CirclePlus />
        </Button>
      </div>
    </CardContent>
  );
}
