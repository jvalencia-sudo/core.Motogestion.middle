"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Process } from "@/lib/types/configuration/process";
import { VwOrder } from "@/lib/types/orders/order";
import { useState } from "react";
import { updateOrderProcess } from "./actions";

export default function OrderHeader({
  order,
  processes,
}: {
  order: VwOrder;
  processes: Process[];
}) {
  const [processId, setProcessId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function updateProcess() {
    if (processId) {
      setLoading(true);
      const resp = await updateOrderProcess(order.orderId, processId);

      if (resp.error) {
        toast({
          title: "An error occurred",
          description: resp.error,
          duration: 5000,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order updated",
          description: "The order has been updated successfully",
        });
      }

      setLoading(false);
      setProcessId(undefined);
    }
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>View and manage order information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Input id="client" value={order.clientName} readOnly />
            </div>
            <div>
              <Label htmlFor="created-at">Created At</Label>
              <Input id="created-at" value={order.createdAt} readOnly />
            </div>
          </div>
          <div>
            <Label htmlFor="process">Process</Label>
            {order.processId && order.processName ? (
              <Input id="process" value={order.processName} readOnly />
            ) : (
              <Select onValueChange={setProcessId}>
                <SelectTrigger>
                  <SelectValue placeholder="Please select a process" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((p) => (
                    <SelectItem
                      key={p.processId}
                      value={p.processId.toString()}
                    >
                      {p.processName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={order.description || ""}
              readOnly
            />
          </div>
        </div>
        {processId && (
          <div className="mt-4 justify-end flex w-full">
            <Button disabled={loading} onClick={updateProcess}>
              Update
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
