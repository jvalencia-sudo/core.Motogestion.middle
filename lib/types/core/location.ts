import { OperationDetail } from "@/lib/types/operation/operation-detail";

export type Location = {
  locationId: number;
  location: string;
  address: string;
  clientId?: number;
};

export type VwLocation = {
  locationId: number;
  location: string;
  address: string;
};

export type LocationDetail = {
  locationId: number;
  units: OperationDetail[];
};
