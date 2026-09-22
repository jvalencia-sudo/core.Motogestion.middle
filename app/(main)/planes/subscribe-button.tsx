"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { crearCheckout } from "./actions";

export default function SubscribeButton({
  plan,
  destacado,
}: {
  plan: string;
  destacado?: boolean;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const resp = await crearCheckout(plan);
    setLoading(false);
    if (resp.error || !resp.data?.checkoutUrl) {
      toast({
        title: "No se pudo iniciar el pago",
        description: resp.error ?? "Intenta de nuevo más tarde.",
      });
      return;
    }
    // Redirige al checkout de Wompi.
    window.location.href = resp.data.checkoutUrl;
  }

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={
        destacado
          ? "w-full bg-orange-500 text-white hover:bg-orange-600"
          : "w-full"
      }
      variant={destacado ? "default" : "outline"}
    >
      {loading && <Loader2 className="mr-1 size-4 animate-spin" />}
      Suscribirme
    </Button>
  );
}
