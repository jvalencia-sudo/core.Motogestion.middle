"use server";
import Empty from "@/components/empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { appFetch } from "@/lib/fetch";
import { Process } from "@/lib/types/configuration/process";
import { VwOrder } from "@/lib/types/orders/order";
import { VwOrderStep } from "@/lib/types/orders/order-step";
import { ArrowLeft, MessageSquare } from "lucide-react";
import OrderDocuments from "../order-documents";
import OrderHeader from "../order-header";
import OrderStatus from "../order-status";
import OrderSteps from "../order-steps";
import OrderMessage from "../order-message";
import Link from "next/link";

async function load(orderCode: string) {
  const [order, process] = await Promise.all([
    appFetch<VwOrder>(`/api/order/${orderCode}`),
    appFetch<Process[]>("/api/process"),
  ]);

  return {
    order,
    process,
    orderSteps: await appFetch<VwOrderStep[]>(
      `/api/order-step/get-by-order/${order.data?.orderId}`,
    ),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { order, process, orderSteps } = await load(id);

  return (
    <div className="container mx-auto px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Order #{id}</h1>
        <Badge variant="outline">{order.data?.orderStateName}</Badge>
      </div>
      {order && order.data ? (
        <div className="grid gap-6 md:grid-cols-3">
          <OrderHeader order={order.data} processes={process.data || []} />
          <OrderStatus data={orderSteps.data || []} />
          <OrderSteps data={orderSteps.data || []} />
          <Card>
            <CardHeader>
              <CardTitle>Order Products</CardTitle>
              <CardDescription>Items included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Melanin</TableCell>
                    <TableCell>5000 kg</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* TODO: Add suspense */}
          <OrderDocuments
            orderId={order.data.orderId}
            orderSteps={orderSteps.data || []}
          />
          <OrderMessage orderId={order.data.orderId} />
        </div>
      ) : (
        <Empty title={`Order #${id} not found`} />
      )}
    </div>
  );
}
