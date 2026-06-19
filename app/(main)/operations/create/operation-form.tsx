"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NationalForm } from "@/app/(main)/operations/create/national-form";
import {
  FormValues,
  internationalOperationSchema,
  nationalOperationSchema,
} from "@/lib/schemas/operation/operation-schemas";
import { createOperation } from "@/app/(main)/operations/actions";
import { Form } from "@/components/ui/form";
import PageHeader from "@/components/page-header";
import { OperationCreateContract } from "@/lib/types/operation/operation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Incoterm } from "@/lib/types/core/incoterm";
import { HazardType } from "@/lib/types/core/hazard-type";
import { VehicleType } from "@/lib/types/core/vehicle-type";
import { UnitType } from "@/lib/types/operation/unit-type";
import { OperationType } from "@/lib/types/operation/operation-type";
import { Location } from "@/lib/types/core/location";
import {
  LAND_OPERATION_TYPE_ID,
  OperationScope,
} from "@/lib/constants/operation-scope";
import { InternationalForm } from "@/app/(main)/operations/create/international-form";
import { DestinationsForm } from "@/app/(main)/operations/create/destination-form";
import { Customer } from "@/lib/types/core/client";

interface OperationFormProps {
  operationDependencies: {
    clients: Customer[];
    incoterms: Incoterm[];
    hazardTypes: HazardType[];
    vehicleTypes: VehicleType[];
    unitTypes: UnitType[];
    operationTypes: OperationType[];
    locations: Location[];
  };
}

export default function OperationForm({
  operationDependencies,
}: OperationFormProps) {
  const [activeTab, setActiveTab] = useState<OperationScope>(
    OperationScope.International,
  );
  const [error, setError] = useState<string>();

  const form = useForm<FormValues>({
    resolver: zodResolver(
      activeTab === OperationScope.National
        ? nationalOperationSchema
        : internationalOperationSchema,
    ),
    defaultValues: {
      requiresEscort: false,
      locations: [],
    },
  });

  function mapFormValuesToContract(
    values: FormValues,
  ): OperationCreateContract {
    const loadDate = values.loadDate;
    const loadHour = values.loadHour;
    if (loadDate && loadHour) {
      const [hour, minute] = loadHour.split(":");
      loadDate.setHours(Number(hour), Number(minute));
    }
    return {
      operationTypeId: values.operationTypeId ?? LAND_OPERATION_TYPE_ID,
      locationOriginId: values.locationOriginId,
      serviceTypeId: values.serviceTypeId,
      requiresEscort: values.requiresEscort ?? null,
      loadDate,
      validityDate: values.validityDate,
      observation: values.observation ?? null,
      hazardTypeIds: values.hazardTypeIds ?? [],
      vehicleTypeIds: values.vehicleTypeIds ?? [],
      incotermIds: values.incotermIds ?? [],
      locations: values.locations.map((location) => ({
        locationId: location.locationId,
        units: location.units.map((unit) => ({
          unitTypeId: unit.unitTypeId,
          unitCount: unit.unitCount,
          unitWeight: unit.unitWeight,
          netWeight: Number(unit.netWeight.toFixed(2)),
          grossWeight: Number(unit.grossWeight.toFixed(2)),
          height: unit.height ?? null,
          width: unit.width ?? null,
          length: unit.length ?? null,
        })),
      })),
    };
  }

  async function onSubmit(values: FormValues) {
    const isValid = await form.trigger();
    if (!isValid) return;

    const operation = mapFormValuesToContract(values);

    const resp = await createOperation(operation);
    if (resp?.error) {
      setError(resp.error);
    }
  }

  const handleTabChange = (value: string) => {
    if (value in OperationScope) {
      setActiveTab(value as OperationScope);
      form.reset({});
    }
  };

  return (
    <>
      <PageHeader title="Create operation" subtitle="Create a new operation." />
      <Form {...form}>
        <form
          onSubmit={(event) => {
            form.handleSubmit(onSubmit)(event);
          }}
        >
          <Card className="mb-4">
            <CardContent className="py-4">
              <Tabs
                defaultValue={OperationScope.International}
                onValueChange={handleTabChange}
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value={OperationScope.International}>
                    International
                  </TabsTrigger>
                  <TabsTrigger value={OperationScope.National}>
                    National
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={OperationScope.International}>
                  <InternationalForm
                    incoterms={operationDependencies.incoterms}
                    operationTypes={operationDependencies.operationTypes}
                    hazardTypes={operationDependencies.hazardTypes}
                    locations={operationDependencies.locations}
                    vehicleTypes={operationDependencies.vehicleTypes}
                  />
                </TabsContent>

                <TabsContent value={OperationScope.National}>
                  <NationalForm
                    vehicleTypes={operationDependencies.vehicleTypes}
                    hazardTypes={operationDependencies.hazardTypes}
                    locations={operationDependencies.locations}
                    clients={operationDependencies.clients}
                  />
                </TabsContent>
              </Tabs>
              <DestinationsForm
                clients={operationDependencies.clients}
                locations={operationDependencies.locations}
                unitTypes={operationDependencies.unitTypes}
              />

              <div className="mt-4 justify-end flex w-full">
                <Button type="submit">Save</Button>
              </div>
            </CardContent>
          </Card>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </>
  );
}
