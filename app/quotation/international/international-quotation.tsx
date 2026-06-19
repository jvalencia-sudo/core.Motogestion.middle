"use client";

import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Incoterm } from "@/lib/types/core/incoterm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VwLocation } from "@/lib/types/core/location";
import RemoveButton from "@/components/remove-button";
import SectionSeparator from "@/components/section-separator";
import { Input } from "@/components/ui/input";
import TableWithGroupedData from "@/components/units/table";
import { UnitDetail } from "@/lib/types/core/unit-detail";
import { VwOperationWithDetail } from "@/lib/types/operation/operation";
import OperationDetails from "@/app/quotation/operation-description";
import { createInternationalOffer } from "@/app/quotation/actions";
import { CirclePlus } from "lucide-react";
import { Currency } from "@/lib/types/operation/currency";
import {
  InternationalQuotationFormValues,
  internationalQuotationSchema,
} from "@/lib/schemas/core/offer-schema";
import { InternationalQuotationForm } from "../international-quotation-form";

type QuotationInternationalPageProps = {
  offerDependencies: {
    incoterms: Incoterm[];
    currencies: Currency[];
    locations: VwLocation[];
    unitDetails: UnitDetail[];
    operationWithDetails: VwOperationWithDetail | null;
  };
  offerKey: string;
};

export default function InternationalQuotationPage({
  offerDependencies,
  offerKey,
}: QuotationInternationalPageProps) {
  const [error, setError] = useState<string>();
  const form = useForm<InternationalQuotationFormValues>({
    resolver: zodResolver(internationalQuotationSchema),
    defaultValues: {
      locations: [],
    },
  });

  const { control, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "locations",
  });
  const selectedLocations = watch("locations").map((loc) => loc.locationId);
  const availableLocations = offerDependencies.locations.filter(
    (loc) => !selectedLocations.includes(loc.locationId),
  );

  const onSubmit = async (values: InternationalQuotationFormValues) => {
    const resp = await createInternationalOffer(values, offerKey || "");
    if (resp?.error) {
      setError(resp.error);
    }
  };

  return (
    <Card className="space-y-6 p-4 ">
      <Card>
        <CardHeader>
          <CardTitle className="text-1.5xl">Operation overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <OperationDetails
              dataOperation={offerDependencies.operationWithDetails}
              language="en"
            />
            <TableWithGroupedData
              unitDetailsData={offerDependencies.unitDetails}
            />
          </div>
          <SectionSeparator title={"Destinations"} />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-6">
                  <Card className="grid grid-cols-[1fr,auto] gap-6">
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={control}
                          name={`locations.${index}.locationId`}
                          render={({ field }) => {
                            const selectedLocations = watch("locations").map(
                              (loc) => loc.locationId,
                            );
                            const availableLocations =
                              offerDependencies.locations.filter(
                                (loc) =>
                                  !selectedLocations.includes(loc.locationId) ||
                                  loc.locationId === field.value,
                              );

                            return (
                              <FormItem className="flex-1">
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => {
                                      field.onChange(Number(value));
                                      const selectedLocation =
                                        offerDependencies.locations.find(
                                          (loc) =>
                                            loc.locationId.toString() === value,
                                        );
                                      if (selectedLocation) {
                                        setValue(
                                          `locations.${index}.address`,
                                          selectedLocation.address,
                                        );
                                        setValue(
                                          `locations.${index}.locationName`,
                                          selectedLocation.location,
                                        );
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select location..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableLocations.map((loc) => (
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
                            );
                          }}
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
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="hidden"
                              value={
                                watch(`locations.${index}.locationName`) || ""
                              }
                              disabled
                            />
                          </FormControl>
                        </FormItem>
                      </div>
                      <InternationalQuotationForm
                        currencies={offerDependencies.currencies}
                        incoterms={offerDependencies.incoterms}
                        indexLocation={index}
                      />
                    </div>

                    <div className=" flex flex-col justify-center">
                      <RemoveButton onRemove={() => remove(index)} />
                    </div>
                  </Card>
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="dashed"
                  onClick={() =>
                    append({
                      locationId: 0,
                      locationName: "",
                      address: "",
                      quotations: [],
                    })
                  }
                  disabled={availableLocations.length === 0}
                >
                  Add Destination
                  <CirclePlus></CirclePlus>
                </Button>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="submit">Send</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Card>
  );
}
