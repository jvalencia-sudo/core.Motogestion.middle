"use server";

import { appFetch } from "@/lib/fetch";
import { Incoterm } from "@/lib/types/core/incoterm";
import { HazardType } from "@/lib/types/core/hazard-type";
import { VehicleType } from "@/lib/types/core/vehicle-type";
import { OperationType } from "@/lib/types/operation/operation-type";
import { UnitType } from "@/lib/types/operation/unit-type";
import { OperationCreateContract } from "@/lib/types/operation/operation";
import { permanentRedirect } from "next/navigation";
import { Location } from "@/lib/types/core/location";
import { Customer } from "@/lib/types/core/client";

export async function createOperation(data: OperationCreateContract) {
  const resp = await appFetch("/api/operation/create", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!resp.error) {
    permanentRedirect("/operations");
  }
  return resp;
}

export async function loadCreateOperationDependencies() {
  try {
    const [
      { data: clients },
      { data: incoterms },
      { data: hazardTypeData },
      { data: vehicleTypes },
      { data: operationTypes },
      { data: unitTypes },
      { data: locations },
    ] = await Promise.all([
      appFetch<Customer[]>("/api/client"),
      appFetch<Incoterm[]>("/api/incoterm"),
      appFetch<HazardType[]>("/api/hazard-type"),
      appFetch<VehicleType[]>("/api/vehicle-type"),
      appFetch<OperationType[]>("/api/operation-type"),
      appFetch<UnitType[]>("/api/unit-type"),
      appFetch<Location[]>("/api/location"),
    ]);

    return {
      clients: clients || [],
      incoterms: incoterms || [],
      hazardTypes: hazardTypeData || [],
      vehicleTypes: vehicleTypes || [],
      operationTypes: operationTypes || [],
      unitTypes: unitTypes || [],
      locations: locations || [],
    };
  } catch (error) {
    throw new Error("Error loading data");
  }
}
