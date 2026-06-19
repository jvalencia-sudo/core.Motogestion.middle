"use server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderStateEnum } from "@/lib/constants/order-state";
import { appFetch } from "@/lib/fetch";
import { StepState } from "@/lib/types/configuration/step-state";
import { VwOrderStep } from "@/lib/types/orders/order-step";
import { CheckCircle, Clock } from "lucide-react";
import UpdateStatus from "./update-status";

async function load() {
  return {
    stepState: await appFetch<StepState[]>("/api/step-state"),
  };
}

export default async function OrderStatus({ data }: { data: VwOrderStep[] }) {
  const { stepState } = await load();
  function getBadge(os: VwOrderStep) {
    switch (os.stepStateId) {
      case OrderStateEnum.Complete:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case OrderStateEnum.InProgress:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case OrderStateEnum.NotStarted:
        return <Clock className="h-4 w-4" />;
    }
  }

  const getCurrentProcess = () =>
    data
      .filter((m) => m.stepStateId == OrderStateEnum.InProgress)
      .map((o) => <Badge key={o.stepId}>{o.stepName}</Badge>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Current step and overall progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            Current Step{getCurrentProcess().length > 1 && "s"}:
          </span>
          {getCurrentProcess()}
        </div>
        <div className="space-y-2">
          {data.map((o) => (
            <div key={o.orderId} className="flex items-center gap-2">
              {getBadge(o)}
              <span>{o.stepName}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <UpdateStatus orderSteps={data} stepState={stepState.data || []} />
      </CardFooter>
    </Card>
  );
}
