"use client";

import { CirclePlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";

export function CreateButton() {
  const { hasPermission } = usePermissions();

  if (!hasPermission("crear:reclamos")) {
    return null;
  }

  return (
    <Link href="/reclamos/crear">
      <Button className="h-8">
        <CirclePlusIcon className="mr-2 h-4 w-4" />
        Crear Reclamo
      </Button>
    </Link>
  );
}
