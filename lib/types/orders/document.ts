export type Document = {
  documentId: number;
  documentName: string;
  documentKey: string;
  createdAt: string;
  currentVersion: number;
  orderId: number;
  orderStepId: number | null;
};

export type VwDocument = Document & {
  stepName: string | null;
  stepOrder: number | null;
  visibleToClient: boolean | null;
};
