import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OrderStateEnum } from "@/lib/constants/order-state";
import { VwOrder } from "@/lib/types/orders/order";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function OrderStats({ orders }: { orders: Array<VwOrder> }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg bg-card/30 backdrop-blur-sm">
        <CardHeader className="items-center gap-2 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full " />
            <div className="relative size-12 rounded-full bg-card flex items-center justify-center bg-[#9cc9c2]">
              <Clock className="size-6" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-lg">
              Pending Orders
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Orders that require attention
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="text-3xl font-semibold">
            {
              orders.filter((m) => m.orderStateId !== OrderStateEnum.Complete)
                .length
            }
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-lg bg-card/30 backdrop-blur-sm">
        <CardHeader className="items-center gap-2 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full " />
            <div className="relative size-12 rounded-full bg-card flex items-center justify-center bg-[#9cc9c2]">
              <CheckCircle2 className="size-6" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-lg">
              Completed Orders
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Orders that have been fulfilled
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="text-3xl font-semibold">
            {
              orders.filter((m) => m.orderStateId === OrderStateEnum.Complete)
                .length
            }
          </p>
        </CardContent>
      </Card>
      {/* <Card className="shadow-lg bg-card/30 backdrop-blur-sm">
        <CardHeader className="items-center gap-2 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full " />
            <div className="relative size-12 rounded-full bg-card flex items-center justify-center bg-[#9cc9c2]">
              <AlertCircle className="size-6" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-lg">
              Documents with Issues
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Documents that require attention
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="text-3xl font-semibold"> 1 </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
