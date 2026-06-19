"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VwOrderStep } from "@/lib/types/orders/order-step";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Paperclip } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { uploadDocument } from "./actions";

const formSchema = z.object({
  orderStepId: z.string(),
  file: z.any(),
  orderId: z.number(),
});

export default function UploadFile({
  orderSteps,
  orderId,
}: {
  orderSteps: VwOrderStep[];
  orderId: number;
}) {
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(undefined);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("orderId", String(values.orderId));
    formData.append("orderStepId", String(values.orderStepId));

    const resp = await uploadDocument(formData);
    if (resp.error) {
      setError(resp.error);
    } else {
      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully",
      });
      setOpen(false);
    }
    form.reset();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Paperclip className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Order Documents</DialogTitle>
          <DialogDescription>
            Upload new documents or update existing ones for this order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 py-4">
              <div className="items-center gap-4">
                <FormField
                  control={form.control}
                  name="orderStepId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="col-span-4">
                            <SelectValue placeholder="Please choose a step" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderSteps.map((o, i) => (
                            <SelectItem
                              key={i}
                              value={o.orderStepId.toString()}
                            >
                              {o.stepName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="items-center gap-4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <Input type="file" onChange={handleFileChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="mb-4">
              <Button type="submit" disabled={loading}>
                Upload File
              </Button>
            </DialogFooter>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
