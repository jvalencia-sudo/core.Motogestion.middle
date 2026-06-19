import { AppResponse, ErrorResponse } from "@/lib/types/response";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

export async function appFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Promise<AppResponse<T>> {
  if (typeof input === "string") {
    input = new URL(input, process.env.APP_BASE_URL);
  }
  const cookiesStore = await cookies();
  if (init) {
    let headers = init.headers;
    if (!headers) headers = {};
    headers = { ...headers, Cookie: cookiesStore.toString() };
    init = { ...init, headers, cache: "no-store" };
  } else {
    init = { headers: { Cookie: cookiesStore.toString() }, cache: "no-store" };
  }

  try {
    const resp = await fetch(input, init);

    // Intentar leer JSON en todos los casos (éxito y error)
    let responseData: any = null;
    try {
      responseData = await resp.json();
    } catch {
      // Si no hay JSON (ej: respuesta vacía), continuar sin JSON
    }

    // Status 204 sin contenido
    if (resp.status === 204) {
      return { data: null };
    }

    if (resp.ok) {
      // Éxito: devolver los datos
      return { data: responseData as T };
    } else {
      // Error: extraer el mensaje
      if (resp.status === 401) permanentRedirect("/auth/logout");

      let errorMessage = "Ha ocurrido un error inesperado";

      // Intentar extraer mensaje del JSON (puede ser 'detail' o 'message')
      if (responseData) {
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }

      return { data: null, error: errorMessage };
    }
  } catch (ex) {
    // We do this cause redirect throw a exception so we need to throw the exception
    // again because the redirect is inside a try/catch block
    if (isRedirectError(ex)) {
      throw ex;
    }
  }
  return { data: null, error: "Ha ocurrido un error inesperado" };
}
