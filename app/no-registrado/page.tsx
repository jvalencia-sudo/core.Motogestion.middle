import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function NoRegistradoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Tu cuenta no está registrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Iniciaste sesión correctamente, pero tu correo no está habilitado en MotoGestión.
          Pídele a un administrador de tu taller que te invite, o registra tu taller para empezar.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a href="/auth/logout">
            <Button variant="outline" className="w-full">
              Cerrar sesión e intentar con otra cuenta
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
