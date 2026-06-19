export type UnitDetail = {
  unitTypeName: string;
  unitCount: number;
  unitWeight: number;
  netWeight: number;
  grossWeight: number;
  destination: string;
  address: string;
  height?: number;
  width?: number;
  length?: number;
};

export type OperationDetail = {
  origin: string;
  incoterms: string[];
  ends_on: string;
  comment: string;
};
