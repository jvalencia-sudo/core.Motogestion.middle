"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* NextError es la página de error por defecto de Next. Su tipo exige
        un statusCode, pero el App Router no expone códigos de estado para
        errores de render, así que se pasa 0 para un mensaje genérico. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
