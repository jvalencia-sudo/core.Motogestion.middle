"use client";
import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RemoveButton from "@/components/remove-button";
import SectionSeparator from "@/components/section-separator";
import { CirclePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TableBody, TableCell, TableRow, Table } from "@/components/ui/table";
import { VwLocation } from "@/lib/types/core/location";
import { handleNumericChange } from "@/lib/form-utils";
import { Currency } from "@/lib/types/operation/currency";
import { NationalQuotationFormValues } from "@/lib/schemas/core/offer-schema";

type QuotationNationalFormProps = {
  currencies: Currency[];
  locations: VwLocation[];
};

export function NationalQuotationForm({
  currencies,
  locations,
}: QuotationNationalFormProps) {
  const [selectedCurrencyName, setSelectedCurrencyName] = useState("");
  const { control, watch, setValue } =
    useFormContext<NationalQuotationFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `quotations`,
  });

  const selectedCurrencyId = watch(
    `quotations.${fields.length - 1}.currencyId`,
  );

  useEffect(() => {
    const selectedCurrency = currencies.find(
      (currency) =>
        currency.currencyId.toString() === selectedCurrencyId?.toString(),
    );
    setSelectedCurrencyName(
      selectedCurrency ? selectedCurrency.currencyName : "",
    );
  }, [selectedCurrencyId]);

  const totalTariff = useWatch({
    control,
    name: `quotations.${fields.length - 1}.locations`,
  })?.reduce((sum, location) => sum + (Number(location.tariff) || 0), 0);

  useEffect(() => {
    if (fields.length > 0) {
      setValue(`quotations.${fields.length - 1}.totalTariff`, totalTariff);
    }
  }, [totalTariff, fields.length, setValue]);

  const defaultQuotation = {
    validUntil: new Date(),
    freeLoading: false,
    availabilityRequestedDate: true,
    loadingDate: new Date(),
    totalTariff: 0,
    locations: locations.map((loc) => ({
      locationId: loc.locationId,
      address: loc.address,
      locationName: loc.location,
      tariff: 0,
    })),
    currencyId: 2,
    currencyName: "COP",
    observation: "",
  };

  return (
    <div>
      <SectionSeparator title="Cotizaciones" />
      {fields.map((field, index) => (
        <div key={field.id} className="pb-3">
          <Card className="grid grid-cols-[1fr,auto] gap-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`quotations.${index}.validUntil`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valida hasta</FormLabel>
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
                  name={`quotations.${index}.freeLoading`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Libres de cargue</FormLabel>
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
                  name={`quotations.${index}.availabilityRequestedDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Disponibilidad en la fecha solicitada
                      </FormLabel>
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
                {!watch(`quotations.${index}.availabilityRequestedDate`) && (
                  <FormField
                    control={control}
                    name={`quotations.${index}.loadingDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de carga</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={(date) =>
                              field.onChange(date || undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={control}
                  name={`quotations.${index}.currencyId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
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
                                `quotations.${index}.currencyName`,
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
                  name={`quotations.${index}.observation`}
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Añade tus observaciones"
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="min-h-[60px] resize-none col-end-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardContent className="col-span-3">
                  <CardTitle className="py-2">Tarifas</CardTitle>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <Table>
                      <TableBody>
                        {locations.map((location, locIndex) => (
                          <TableRow key={locIndex} className="border-b">
                            <TableCell>
                              <FormLabel>{location.location}</FormLabel>
                            </TableCell>
                            <TableCell className="w-3/3">
                              <FormField
                                control={control}
                                name={`quotations.${index}.locations.${locIndex}.tariff`}
                                render={({ field }) => (
                                  <FormItem className="w-full flex justify-end">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        placeholder="Ingresa la tarifa"
                                        onChange={(e) =>
                                          handleNumericChange(
                                            field.onChange,
                                            e.target.value,
                                          )
                                        }
                                        value={field.value || 0}
                                        className="w-3/5"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>

                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`quotations.${index}.totalTariff`}
                      render={() => (
                        <FormItem>
                          <FormLabel>Tarifa Total</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              readOnly
                              value={totalTariff || 0}
                              className="w-full bg-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name={`quotations.${index}.currencyT`}
                      render={() => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              readOnly
                              value={selectedCurrencyName}
                              className="w-full bg-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex flex-col gap-3 justify-center items-center">
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
          Añadir cotizacion
          <CirclePlus />
        </Button>
      </div>
    </div>
  );
}
