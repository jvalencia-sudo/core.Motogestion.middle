"use server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appFetch } from "@/lib/fetch";
import { VwMessage } from "@/lib/types/orders/message";
import { VwOrder } from "@/lib/types/orders/order";
import { AlertCircle, CheckCircle2, Clock, MailX } from "lucide-react";
import OrdersTab from "./orders-tab";
import Empty from "@/components/empty";
import Link from "next/link";
import OrderStats from "./order-stats";

async function load() {
  return {
    orders: await appFetch<Array<VwOrder>>("/api/order"),
    messages: await appFetch<Array<VwMessage>>("/api/message/recent"),
  };
}

export default async function Page() {
  const data = await load();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-6">
          {/* Order Overview Cards */}
          <OrderStats orders={data.orders.data || []} />
          {/* Order Management Tabs */}
          <OrdersTab orders={data.orders.data || []} />
          {/* Communication Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Latest communications regarding orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.messages.data ? (
                  data.messages.data.map((m, i) => (
                    <div className="flex flex-col gap-1" key={m.messageId}>
                      <div className="flex items-center gap-2">
                        <Link href={`/orders/${m.orderCode}#messages`}>
                          <Badge variant="secondary">{m.orderCode}</Badge>
                        </Link>
                        {!m.title ? (
                          <span className="text-sm font-medium">
                            New message from {m.sender}
                          </span>
                        ) : (
                          <span
                            className="text-sm font-medium"
                            dangerouslySetInnerHTML={{ __html: m.title }}
                          ></span>
                        )}
                      </div>
                      <p
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: m.messageContent }}
                      ></p>
                    </div>
                  ))
                ) : (
                  <Empty
                    title="There are no recent messages"
                    noShadow
                    icon={MailX}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
