export type OperationDetail = {
  unitTypeId: number;
  unitCount: number;
  unitWeight: number;
  netWeight: number;
  grossWeight: number;
  height: number | null;
  width: number | null;
  length: number | null;
};

export type VwOperationDetail = {
  unitType: string;
  unitCount: number;
  unitWeight: number;
  netWeight: number;
  grossWeight: number;
  height: number | null;
  width: number | null;
  length: number | null;
};
