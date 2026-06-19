"use server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStateEnum } from "@/lib/constants/order-state";
import { VwOrderStep } from "@/lib/types/orders/order-step";

export default async function OrderSteps({ data }: { data: VwOrderStep[] }) {
  function getBadge(os: VwOrderStep) {
    switch (os.stepStateId) {
      case OrderStateEnum.Complete:
        return <Badge variant="default">{os.stepStateName}</Badge>;
      case OrderStateEnum.InProgress:
        return <Badge variant="secondary">{os.stepStateName}</Badge>;
      case OrderStateEnum.NotStarted:
        return <Badge variant="outline">{os.stepStateName}</Badge>;
    }
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Order Steps</CardTitle>
        <CardDescription>
          Detailed information about each step in the order process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((os) => (
              <TableRow key={os.orderStepId}>
                <TableCell>{os.stepName}</TableCell>
                <TableCell>{getBadge(os)}</TableCell>
                <TableCell>{new Date(os.updatedAt).toLocaleString()}</TableCell>
                <TableCell className="w-40">{os.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
