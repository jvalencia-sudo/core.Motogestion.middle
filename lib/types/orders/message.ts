export type Message = {
  messageId: number;
  orderId: number;
  sender: string;
  title: string;
  senderId: number | null;
  messageContent: string;
  createdAt: string;
};

export type VwMessage = {
  orderCode: string;
  clientId: number;
} & Message;
