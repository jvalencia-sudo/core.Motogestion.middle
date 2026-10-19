"use client";

import { useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { crearCheckout } from "./actions";

// Widget de Wompi (modal embebido, no un redirect de página completa).
// El resultado del callback es solo para la UX inmediata -- la activación
// real de la suscripción la hace el webhook del backend (server-to-server),
// nunca este resultado del lado del cliente.
declare global {
  interface Window {
    WidgetCheckout?: new (config: {
      currency: string;
      amountInCents: number;
      reference: string;
      publicKey: string;
      signature: { integrity: string };
    }) => {
      open: (
        callback: (result: { transaction?: { status: string } }) => void
      ) => void;
    };
  }
}

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
    if (resp.error || !resp.data) {
      setLoading(false);
      toast({
        title: "No se pudo iniciar el pago",
        description: resp.error ?? "Intenta de nuevo más tarde.",
      });
      return;
    }
    if (!window.WidgetCheckout) {
      setLoading(false);
      toast({
        title: "No se pudo abrir el pago",
        description: "Intenta de nuevo en unos segundos.",
      });
      return;
    }

    const { publicKey, currency, amountInCents, reference, signature } = resp.data;
    const checkout = new window.WidgetCheckout({
      currency,
      amountInCents,
      reference,
      publicKey,
      signature: { integrity: signature },
    });

    checkout.open((result) => {
      setLoading(false);
      const estado = result?.transaction?.status;
      if (estado === "APPROVED" || estado === "PENDING") {
        // Recarga completa (no router.push): /planes y /planes/gracias
        // comparten el layout, y Next reutiliza ese layout ya montado en
        // navegación SPA sin volver a pedirlo al servidor -- el banner de
        // "prueba gratis" se quedaría con el estado viejo aunque el webhook
        // ya haya aprobado el pago. Una navegación de documento completo no
        // tiene ese problema.
        window.location.href = "/planes/gracias";
      } else if (estado) {
        toast({
          title: "El pago no se completó",
          description: "Puedes intentarlo de nuevo cuando quieras.",
        });
      }
      // Sin transaction (el usuario cerró el modal sin pagar): no hacemos nada.
    });
  }

  return (
    <>
      {/* id estable: Next no vuelve a inyectarlo si ya hay varios botones en
          la misma página (ej. un plan por tarjeta). */}
      <Script id="wompi-widget" src="https://checkout.wompi.co/widget.js" strategy="lazyOnload" />
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
    </>
  );
}
