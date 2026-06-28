"use client";

import { useEffect, useState } from "react";

import { getTallerName } from "./actions";

// Lee el nombre del taller tras montar (igual que el sidebar con los permisos).
// Evita el problema de timing: en el primer login la cookie "taller" se setea en la
// respuesta del middleware, así que el server component aún no la ve; al leerla del
// cliente, la cookie ya está disponible.
export function TallerName() {
  const [taller, setTaller] = useState<string | null>(null);

  useEffect(() => {
    getTallerName().then(setTaller);
  }, []);

  if (!taller) return null;

  return <p className="text-lg font-medium text-primary mb-1">{taller}</p>;
}
