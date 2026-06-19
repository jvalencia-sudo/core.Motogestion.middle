"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { VwLocation } from "@/lib/types/core/location";
import { UnitDetail } from "@/lib/types/core/unit-detail";
import OperationDetails from "@/app/quotation/operation-description";
import TableWithGroupedData from "@/components/units/table";
import { VwOperationWithDetail } from "@/lib/types/operation/operation";
import { createNationalOffer } from "@/app/quotation/actions";
import { Currency } from "@/lib/types/operation/currency";
import {
  NationalQuotationFormValues,
  nationalQuotationSchema,
} from "@/lib/schemas/core/offer-schema";
import { NationalQuotationForm } from "@/app/quotation/national-quotation-form";

type QuotationNationalPageProps = {
  offerDependencies: {
    currencies: Currency[];
    locations: VwLocation[];
    unitDetails: UnitDetail[];
    operationWithDetails: VwOperationWithDetail | null;
  };
  offerKey: string;
};

export default function NationalQuotationPage({
  offerDependencies, 
  offerKey,
}: QuotationNationalPageProps) {
  const [error, setError] = useState("");

  const form = useForm<NationalQuotationFormValues>({
    resolver: zodResolver(nationalQuotationSchema),
    defaultValues: { quotations: [] },
  });

  const onSubmit = async (values: NationalQuotationFormValues) => {
    try {
      const resp = await createNationalOffer(values, offerKey || "");
      if (resp?.error) {
        setError(resp.error);
      } else {
        alert("Quotations saved successfully!");
      }
    } catch (error) {
      alert("Error saving quotations. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-1xl">
            Descripción de la operación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <OperationDetails
              dataOperation={offerDependencies.operationWithDetails}
              language="es"
            />
            <TableWithGroupedData
              unitDetailsData={offerDependencies.unitDetails}
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <NationalQuotationForm
                currencies={offerDependencies.currencies}
                locations={offerDependencies.locations}
              />
              <div className="flex justify-end gap-4">
                <Button type="submit">Enviar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
