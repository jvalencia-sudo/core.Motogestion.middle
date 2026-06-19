export type Order = {
  orderId: number;
  orderCode: string;
  clientId: string;
  processId: number | null;
  orderStateId: number;
  description: string | null;
  createdAt: string;
};

export type VwOrder = Order & {
  clientName: string;
  email: string;
  clientCode: string;
  processName: string | null;
  orderStateName: string;
};
