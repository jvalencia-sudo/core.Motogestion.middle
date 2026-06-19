import { LocationDetail } from "@/lib/types/core/location";
import { VwOperationDetail } from "@/lib/types/operation/operation-detail";

export type VwOperationModel = {
  operationId: number;
  operationTypeName: string;
  locationOriginName: string;
  serviceTypeName: string;
  userName: string;
  requiredEscort: boolean | null;
  loadDate: Date;
  validityDate: Date;
  createdAt: Date;
  observation: string | null;
  operationStatusName: string;
  offerCount: number;
  incoterms: string[];
  operationDetails: VwOperationDetail[];
};

export type VwOperationWithDetail = {
  operationId: number;
  requiresEscort: boolean | null;
  loadDate: string;
  createdAt: string;
  observation: boolean | null;
  operationTypeName: string;
  locationOriginName: string;
  serviceTypeName: string;
  operationStatusName: string;
  offerCount: number;
  incoterms: string[];
  hazardTypes: string[];
  vehicleTypes: string[];
  isLocal: boolean;
};

export type OperationCreateContract = {
  operationTypeId: number;
  locationOriginId: number;
  serviceTypeId: number;
  requiresEscort?: boolean;
  loadDate: Date;
  validityDate: Date;
  observation: string | null;
  hazardTypeIds: number[];
  vehicleTypeIds: number[];
  incotermIds: number[];
  locations: LocationDetail[];
};
