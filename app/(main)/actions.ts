"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getPermissions(): Promise<string[]> {
  const store = await cookies();
  const cachedPermissions = store.get("permissions");
  if (cachedPermissions) {
    return JSON.parse(cachedPermissions.value);
  }
  return [];
}

export async function logout() {
  const store = await cookies();
  store.delete("permissions");
  store.delete("logged");
  redirect("/auth/logout");
}
