"use server";

import { appFetch } from "@/lib/fetch";
import { permanentRedirect } from "next/navigation";
import {Vista} from "@/lib/types/auth/vista";

export async function crearVista(data: Vista) {
  const resp = await appFetch("/api/vista", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!resp.error) {
    permanentRedirect("/vistas");
  }
  return resp;
}
