"use server";
import { appFetch } from "@/lib/fetch";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateOrderProcess(orderId: number, processId: string) {
  const resp = await appFetch(`/api/order/${orderId}/update-process`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ process_id: parseInt(processId) }),
  });
  revalidatePath("/orders");
  return resp;
}

export async function updateOrderStep({
  orderStepId,
  stateId,
  notes,
}: {
  orderStepId: string;
  stateId: string;
  notes?: string;
}) {
  const resp = await appFetch(`/api/order-step/${orderStepId}/update-state`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ stateId: parseInt(stateId), notes: notes || null }),
  });
  if (!resp.error) {
    revalidatePath("/orders");
  }
  return resp;
}

export async function uploadDocument(form: FormData) {
  const resp = await appFetch(`/api/document/upload-file`, {
    body: form,
    method: "POST",
  });
  if (!resp.error) {
    revalidateTag("/orders");
  }
  return resp;
}

export async function uploadDocumentVersion(form: FormData) {
  const resp = await appFetch(`/api/document/upload-version`, {
    body: form,
    method: "POST",
  });
  if (!resp.error) {
    revalidatePath("/orders");
  }
  return resp;
}

export async function sendMessage(form: FormData) {
  const resp = await appFetch(`/api/message`, {
    body: form,
    method: "POST",
  });
  if (!resp.error) {
    revalidatePath("/orders");
  }
  return resp;
}
