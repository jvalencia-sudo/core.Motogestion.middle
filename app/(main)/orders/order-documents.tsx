"use server";

import Empty from "@/components/empty";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appFetch } from "@/lib/fetch";
import { VwDocument } from "@/lib/types/orders/document";
import { VwOrderStep } from "@/lib/types/orders/order-step";
import { File } from "lucide-react";
import UploadFile from "./upload-file";
import DocumentVersioning from "./document-versioning";

async function load(orderId: number) {
  return await appFetch<VwDocument[]>(`/api/document/get-by-order/${orderId}`);
}

export default async function OrderDocuments({
  orderId,
  orderSteps,
}: {
  orderId: number;
  orderSteps: VwOrderStep[];
}) {
  const { data, error } = await load(orderId);

  const groups = () => {
    if (data) return Array.from(new Set(data.map((m) => m.stepName)));
    return [];
  };

  const documents = (group: string | null) => {
    if (data) return data.filter((m) => m.stepName === group);
    return [];
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Order-related files and documents</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {groups().map((m) => (
              <AccordionItem value={m || ""} key={m}>
                <AccordionTrigger>{m}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {documents(m).map((d) => (
                      <div
                        className="flex items-center gap-2"
                        key={d.documentId}
                      >
                        <File className="h-4 w-4" />
                        <span>{d.documentName}</span>
                        <DocumentVersioning document={d} />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Empty
            title="There are no documents for this order"
            icon={File}
            noShadow={true}
          />
        )}
      </CardContent>
      <CardFooter>
        <UploadFile orderSteps={orderSteps || []} orderId={orderId} />
      </CardFooter>
    </Card>
  );
}
