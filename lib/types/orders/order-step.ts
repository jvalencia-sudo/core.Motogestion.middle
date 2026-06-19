export type OrderStep = {
  orderStepId: number;
  orderId: number;
  stepId: number;
  complete: boolean;
  updatedAt: string;
  stepStateId: number;
  notes: string | null;
};

export type VwOrderStep = OrderStep & {
  stepName: string;
  details: string | null;
  stepOrder: number;
  visibleToClient: boolean;
  stepStateName: string;
};
