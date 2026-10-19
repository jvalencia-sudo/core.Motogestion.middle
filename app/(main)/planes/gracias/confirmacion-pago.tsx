"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { obtenerSuscripcion } from "@/app/(main)/suscripcion/actions";

const INTERVALO_MS = 2000;
// El webhook de Wompi suele tardar unos segundos en llegar (en pruebas,
// hasta ~7s) -- 10 intentos de 2s dan margen de sobra antes de rendirse.
const MAX_INTENTOS = 10;

export default function ConfirmacionPago() {
  const router = useRouter();
  const [estado, setEstado] = useState<"confirmando" | "activo" | "demorado">(
    "confirmando",
  );

  useEffect(() => {
    let cancelado = false;
    let intentos = 0;

    async function verificar() {
      const suscripcion = await obtenerSuscripcion();
      if (cancelado) return;

      if (suscripcion?.estado === "activo") {
        setEstado("activo");
        // El banner de "prueba gratis" vive en el layout compartido -- solo
        // se actualiza si se lo pedimos explícitamente con un refresh.
        router.refresh();
        return;
      }

      intentos += 1;
      if (intentos >= MAX_INTENTOS) {
        setEstado("demorado");
        return;
      }
      setTimeout(verificar, INTERVALO_MS);
    }

    verificar();
    return () => {
      cancelado = true;
    };
  }, [router]);

  if (estado === "activo") {
    return <p className="text-muted-foreground">Tu plan ya está activo.</p>;
  }

  if (estado === "demorado") {
    return (
      <p className="text-muted-foreground">
        El pago está tardando más de lo normal en confirmarse. Si tu banco ya
        te cobró, refresca esta página en un minuto; si el aviso sigue,
        contáctanos.
      </p>
    );
  }

  return (
    <p className="text-muted-foreground">
      Estamos confirmando tu pago con el banco, un momento...
    </p>
  );
}
