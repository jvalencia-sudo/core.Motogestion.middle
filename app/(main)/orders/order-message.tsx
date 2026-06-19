"use server";
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
import { Textarea } from "@/components/ui/textarea";
import { appFetch } from "@/lib/fetch";
import { Message } from "@/lib/types/orders/message";
import { MessageSquare } from "lucide-react";
import { sendMessage } from "./actions";

async function load(orderId: number) {
  return await appFetch<Message[]>(`/api/message/get-by-order/${orderId}`);
}

export default async function OrderMessage({ orderId }: { orderId: number }) {
  const { data, error } = await load(orderId);
  return (
    <Card className="md:col-span-3" id="messages">
      <CardHeader>
        <CardTitle>Communication</CardTitle>
        <CardDescription>
          Messages and updates related to this order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map((m) => (
            <div className="flex gap-4 items-start" key={m.messageId}>
              <Badge variant="secondary" className="mt-0.5">
                {m.sender}
              </Badge>
              <div>
                <p className="text-sm font-medium">
                  <span className="text-xs">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                  {m.title && " - "}
                  <span dangerouslySetInnerHTML={{ __html: m.title }}></span>
                  {/* Order status updated to "In Production" */}
                </p>
                <p
                  className="text-xs text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: m.messageContent }}
                ></p>
              </div>
            </div>
          ))}
          {/* <div className="flex gap-4 items-start">
            <Badge variant="secondary" className="mt-0.5">
              System
            </Badge>
            <div>
              <p className="text-sm font-medium">
                Order status updated to "In Production"
              </p>
              <p className="text-xs text-muted-foreground">
                2023-06-17 02:30 PM
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Badge variant="secondary" className="mt-0.5">
              John (Client)
            </Badge>
            <div>
              <p className="text-sm">
                Can we get an update on the estimated completion date?
              </p>
              <p className="text-xs text-muted-foreground">
                2023-06-18 10:15 AM
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Badge variant="secondary" className="mt-0.5">
              Sarah (Staff)
            </Badge>
            <div>
              <p className="text-sm">
                Hi John, we're currently in the final quality check phase. We
                expect to complete the order by end of day tomorrow.
              </p>
              <p className="text-xs text-muted-foreground">
                2023-06-18 11:30 AM
              </p>
            </div>
          </div> */}
        </div>
      </CardContent>
      <CardFooter>
        {/* TODO: Add feedback when message is sent or error */}
        <form action={sendMessage} className="w-full">
          <div className="flex w-full gap-2">
            <input type="hidden" name="orderId" value={orderId} />
            <Textarea
              placeholder="Type your message here..."
              className="flex-grow"
              name="message"
            />
            <Button type="submit">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
