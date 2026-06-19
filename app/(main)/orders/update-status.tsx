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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OrderStateEnum } from "@/lib/constants/order-state";
import { StepState } from "@/lib/types/configuration/step-state";
import { VwOrderStep } from "@/lib/types/orders/order-step";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateOrderStep } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";

const formSchema = z.object({
  orderStepId: z.string(),
  stateId: z.string(),
  notes: z.string().optional(),
});

export default function UpdateStatus({
  orderSteps,
  stepState,
}: {
  orderSteps: VwOrderStep[];
  stepState: StepState[];
}) {
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { hasPermission } = usePermissions();

  const orderStepId = form.watch("orderStepId");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(undefined);
    setLoading(true);
    const resp = await updateOrderStep(values);
    if (resp.error) {
      setError(resp.error);
    } else {
      toast({
        title: "Order updated",
        description: "The order has been updated successfully",
      });
      setOpen(false);
      form.resetField("orderStepId");
      form.resetField("stateId");
      form.resetField("notes");
    }
    setLoading(false);
  }

  const stateOptions = useMemo(() => {
    const step = orderSteps.find(
      (m) => m.orderStepId.toString() == orderStepId,
    );
    return stepState.map((o) => (
      <SelectItem
        disabled={step?.stepStateId === o.stepStateId}
        key={o.stepStateId}
        value={o.stepStateId.toString()}
      >
        {o.stepStateName}
      </SelectItem>
    ));
  }, [orderStepId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {hasPermission("ae:delete:me") && (
          <Button className="w-full">Update Status</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the current status of the order and add any relevant notes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                          {orderSteps.map((o) => (
                            <SelectItem
                              key={o.orderStepId}
                              disabled={
                                o.stepStateId === OrderStateEnum.Complete
                              }
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
                  name="stateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="col-span-4">
                            <SelectValue placeholder="Please choose a step" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>{stateOptions}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="items-center gap-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any relevant notes about this status change"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                Save changes
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
