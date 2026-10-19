import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ConfirmacionPago from "./confirmacion-pago";

// Página de retorno tras el pago en Wompi. La activación real la hace el webhook
// (server-to-server); ConfirmacionPago hace polling hasta confirmarla y refresca
// el layout (banner de prueba) en cuanto se active, sin que el usuario tenga que
// recargar a mano.
export default function GraciasPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-500">
        <CheckCircle2 className="size-8" />
      </div>
      <h1 className="text-2xl font-bold">¡Gracias por tu pago!</h1>
      <ConfirmacionPago />
      <Button asChild className="mt-2">
        <Link href="/inicio">Ir al inicio</Link>
      </Button>
    </div>
  );
}
