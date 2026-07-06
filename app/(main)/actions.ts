"use server";

import { cookies } from "next/headers";

export async function getPermissions(): Promise<string[]> {
  const store = await cookies();
  const cached = store.get("permissions");
  // Protegido contra cookie ausente, vacía o malformada (p.ej. justo tras logout).
  if (!cached?.value) return [];
  try {
    return JSON.parse(cached.value);
  } catch {
    return [];
  }
}

export async function getTallerName(): Promise<string | null> {
  const store = await cookies();
  return store.get("taller")?.value ?? null;
}

export async function getPerfilName(): Promise<string | null> {
  const store = await cookies();
  return store.get("perfil")?.value ?? null;
}

// Solo limpia las cookies del sistema (httpOnly, hay que borrarlas en el servidor).
// La navegación a /auth/logout la hace el cliente con un full-reload (window.location)
// para evitar que el router de Next intente un fetch RSC a una ruta que redirige a Auth0.
export async function logout() {
  const store = await cookies();
  store.delete("permissions");
  store.delete("logged");
  store.delete("taller");
  store.delete("perfil");
}
