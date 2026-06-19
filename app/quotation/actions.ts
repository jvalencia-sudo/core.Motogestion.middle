"use server";

import { appFetch } from "@/lib/fetch";

import { Incoterm } from "@/lib/types/core/incoterm";
import { VwLocation } from "@/lib/types/core/location";
import { UnitDetail } from "@/lib/types/core/unit-detail";
import { Currency } from "@/lib/types/operation/currency";
import { VwOperationWithDetail } from "@/lib/types/operation/operation";
import {
  InternationalQuotationFormValues,
  NationalQuotationFormValues,
} from "@/lib/schemas/core/offer-schema";

export async function loadNationalOfferDataDependencies(key: string) {
  try {
    const [
      { data: currencies },
      { data: locations },
      { data: details },
      { data: operationWithDetails },
    ] = await Promise.all([
      appFetch<Currency[]>("/api/public/currency"),
      appFetch<VwLocation[]>(`/api/public/location/get-location-by-key/${key}`),
      appFetch<UnitDetail[]>(
        `/api/public/operation-detail/get-detail-by-key/${key}`,
      ),
      appFetch<VwOperationWithDetail>(
        `/api/public/operation/get-operation-detail-by-key/${key}`,
      ),
    ]);

    return {
      currencies: currencies || [],
      locations: locations || [],
      unitDetails: details || [],
      operationWithDetails: operationWithDetails,
    };
  } catch (error) {
    throw new Error("Error loading data");
  }
}

export async function loadInternationalOfferDataDependencies(key: string) {
  try {
    const [
      { data: incoterms },
      { data: currencies },
      { data: locations },
      { data: details },
      { data: operationWithDetails },
    ] = await Promise.all([
      appFetch<Incoterm[]>("/api/public/incoterm"),
      appFetch<Currency[]>("/api/public/currency"),
      appFetch<VwLocation[]>(`/api/public/location/get-location-by-key/${key}`),
      appFetch<UnitDetail[]>(
        `/api/public/operation-detail/get-detail-by-key/${key}`,
      ),
      appFetch<VwOperationWithDetail>(
        `/api/public/operation/get-operation-detail-by-key/${key}`,
      ),
    ]);

    return {
      incoterms: incoterms || [],
      currencies: currencies || [],
      locations: locations || [],
      unitDetails: details || [],
      operationWithDetails: operationWithDetails,
    };
  } catch (error) {
    throw new Error("Error loading data");
  }
}

export async function createNationalOffer(
  data: NationalQuotationFormValues,
  key: string,
) {
  return await appFetch(`/api/public/offer/create/national/${key}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function createInternationalOffer(
  data: InternationalQuotationFormValues,
  key: string,
) {
  return await appFetch(`/api/public/offer/create/international/${key}`, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
}
