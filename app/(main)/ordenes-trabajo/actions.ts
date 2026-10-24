"use server";

import { appFetch } from "@/lib/fetch";
import { permanentRedirect } from "next/navigation";
import {
  OrdenTrabajoResumen,
  OrdenTrabajoResponse,
  CreateOrdenTrabajoRequest,
  UpdateOrdenTrabajoRequest,
  MotoSelect,
  ProductoSelect,
  UsuarioSelect,
  OtEstado,
  ClienteSelect,
  HistorialEvento,
} from "@/lib/types/ordenTrabajo";
import { Cliente, CreateClienteRequest } from "@/lib/types/cliente";
import { Moto, CreateMotoRequest } from "@/lib/types/moto";
import { Marca } from "@/lib/types/marca";
import { auth0 } from "@/lib/auth0";
import {
  PagoOrden,
  RegistrarPagoRequest,
} from "@/lib/types/pagoOrden";

// Formas crudas de lo que devuelve el backend, solo con los campos que se leen
// aquí (evita "any" sin inventarse el contrato completo del backend).
type MotoRaw = {
  placaMot: string;
  marcaMoto?: string;
  nombreMarca?: string;
  modeloMot: string | number;
  nombreCliente?: string;
};
type ProductoRaw = {
  codPro: number;
  nombrePro: string;
  tipoPro: "BIEN" | "SERVICIO" | "PAQUETE";
  precioPro: number;
  stockPro: number | null;
  impuestos?: { porcentaje?: number }[];
};
type UsuarioSelectRaw = {
  documentoUsu: string;
  nombreCompleto: string;
  esAdminUsu: boolean;
};
type EstadoOtRaw = {
  codOtEst: number;
  nombreOtEst: string;
  descripcionOtEst?: string;
};
type UsuarioAdminRaw = {
  documentoUsu: number | string;
  nombreUsu: string;
  apellido1Usu: string;
  apellido2Usu?: string;
  correoUsu: string;
  subIdUsu?: string;
  codPrfUsu?: number;
  esAdminUsu?: boolean;
};


/**
 * Obtener todas las órdenes de trabajo
 */
export async function obtenerOrdenesTrabajo(): Promise<OrdenTrabajoResumen[]> {
  try {
    const response = await appFetch("/api/ordenes-trabajo");
    if (response.error || !response.data) return [];

    return response.data as OrdenTrabajoResumen[];
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    return [];
  }
}

/**
 * Obtener una orden de trabajo por consecutivo
 */
export async function obtenerOrdenTrabajo(
  consecutivo: number
): Promise<OrdenTrabajoResponse | null> {
  try {
    const response = await appFetch(`/api/ordenes-trabajo/${consecutivo}`);
    if (response.error || !response.data) return null;

    return response.data as OrdenTrabajoResponse;
  } catch (error) {
    console.error("Error obteniendo orden:", error);
    return null;
  }
}

/**
 * Crear nueva orden de trabajo
 */
export async function crearOrdenTrabajo(data: CreateOrdenTrabajoRequest) {
  const resp = await appFetch<OrdenTrabajoResponse>("/api/ordenes-trabajo", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    // F1-01: orden rápida -- mecánico y productos se agregan después, así que
    // se redirige directo a editar en vez de a la lista.
    const consecutivo = resp.data?.consecutivoOt;
    permanentRedirect(
      consecutivo
        ? `/ordenes-trabajo/editar?consecutivo=${consecutivo}`
        : "/ordenes-trabajo"
    );
  }

  return resp;
}

/**
 * Actualizar orden de trabajo
 */
export async function editarOrdenTrabajo(
  consecutivo: number,
  data: UpdateOrdenTrabajoRequest
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // No hacemos redirect aquí, lo maneja el componente después de gestionar productos
  return resp;
}

/**
 * Actualizar cantidad de un producto en orden de trabajo
 */
export async function actualizarCantidadProducto(
  consecutivo: number,
  codPro: number,
  cantidadDeto: number,
  cobrarDeto: boolean = true,
  motivoNoCobroDeto?: string
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/productos/${codPro}`, {
    method: "PATCH",
    body: JSON.stringify({ cantidadDeto, cobrarDeto, motivoNoCobroDeto }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

/**
 * Agregar producto a orden de trabajo
 */
export async function agregarProductoOrden(
  consecutivo: number,
  codPro: number,
  cantidadDeto: number,
  cobrarDeto: boolean = true,
  motivoNoCobroDeto?: string
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/productos`, {
    method: "POST",
    body: JSON.stringify({
      codProDeto: codPro,
      cantidadDeto: cantidadDeto,
      cobrarDeto,
      motivoNoCobroDeto,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

/**
 * F2-02: retira un producto de una orden (reemplaza el antiguo DELETE
 * físico) -- motivo obligatorio. El ítem queda visible, tachado, en vez de
 * desaparecer.
 */
export async function retirarProductoOrden(
  consecutivo: number,
  codPro: number,
  motivo: string
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/productos/${codPro}/retirar`, {
    method: "PATCH",
    body: JSON.stringify({ motivo }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

/**
 * F2-02: diagnóstico del mecánico -- lo ve el cliente final en el link
 * público. Separado de la observación interna de la orden.
 */
export async function guardarDiagnosticoOrden(consecutivo: number, texto: string) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/diagnostico`, {
    method: "PATCH",
    body: JSON.stringify({ texto }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

/**
 * URL para generar el PDF de una orden de trabajo.
 *
 * Es una ruta propia del front (/api/...), NUNCA la URL directa del backend
 * (NEXT_PUBLIC_API_URL): esta última es pública y sin ella el middleware
 * (middleware.ts) no tiene oportunidad de adjuntar el Bearer token de la
 * sesión. El middleware ya reescribe cualquier /api/* hacia el backend con
 * el token puesto (mismo mecanismo que usa appFetch); el backend, a su vez,
 * exige sesión (401 sin token) y aísla por taller vía RLS (404 si la orden
 * es de otro taller). Ver F0-01.
 */
export async function generarPdfOrdenTrabajo(consecutivo: number) {
  "use server";
  return { pdfUrl: `/api/ordenes-trabajo/${consecutivo}/generar-pdf` };
}

/**
 * URL para generar el comprobante de servicio POS de una orden de trabajo.
 * Ver el comentario de generarPdfOrdenTrabajo: misma razón para usar una
 * ruta propia del front.
 */
export async function generarComprobantePdfOrdenTrabajo(consecutivo: number) {
  "use server";
  return { pdfUrl: `/api/ordenes-trabajo/${consecutivo}/generar-comprobante` };
}

/**
 * F1-05: anula una orden completa (motivo obligatorio). El backend devuelve
 * al inventario los bienes de la orden y deja constancia de quién/cuándo --
 * no hay (ni habrá) una forma de BORRAR una orden desde la app.
 */
export async function anularOrdenTrabajo(consecutivo: number, motivo: string) {
  const resp = await appFetch<OrdenTrabajoResponse>(
    `/api/ordenes-trabajo/${consecutivo}/anular`,
    {
      method: "PATCH",
      body: JSON.stringify({ motivo }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return resp;
}

/**
 * F2-01: regenera el link público de estado de la orden -- invalida el
 * anterior de inmediato (deja de existir ninguna fila con ese UUID viejo).
 */
export async function regenerarTokenPublicoOrden(consecutivo: number) {
  return appFetch<{ tokenPublico: string }>(
    `/api/ordenes-trabajo/${consecutivo}/token-publico/regenerar`,
    { method: "PATCH" }
  );
}

/**
 * F1-05: historial de cambios de una orden (lee audit_log). Solo el Admin
 * del taller puede verlo -- el backend ya lo protege con 403.
 */
export async function obtenerHistorialOrden(consecutivo: number): Promise<HistorialEvento[]> {
  try {
    const response = await appFetch(`/api/ordenes-trabajo/${consecutivo}/historial`);
    if (response.error || !response.data) return [];
    return response.data as HistorialEvento[];
  } catch (error) {
    console.error("Error obteniendo historial de la orden:", error);
    return [];
  }
}

/**
 * F1-07: lista los abonos/pagos de una orden (incluye los anulados, con su
 * marca anuladoPago, para que el historial quede visible completo).
 */
export async function listarPagosOrden(consecutivo: number): Promise<PagoOrden[]> {
  try {
    const response = await appFetch(`/api/ordenes-trabajo/${consecutivo}/pagos`);
    if (response.error || !response.data) return [];
    return response.data as PagoOrden[];
  } catch (error) {
    console.error("Error obteniendo pagos de la orden:", error);
    return [];
  }
}

/**
 * F1-07: registra un abono/pago a una orden.
 */
export async function registrarPagoOrden(consecutivo: number, data: RegistrarPagoRequest) {
  return appFetch<PagoOrden>(`/api/ordenes-trabajo/${consecutivo}/pagos`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * F1-07: los pagos no se editan ni se borran -- se anulan con motivo
 * obligatorio (misma idea que anular una orden completa, F1-05).
 */
export async function anularPagoOrden(
  consecutivo: number,
  codPagoOrden: number,
  motivo: string
) {
  return appFetch<PagoOrden>(
    `/api/ordenes-trabajo/${consecutivo}/pagos/${codPagoOrden}/anular`,
    {
      method: "PATCH",
      body: JSON.stringify({ motivo }),
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Obtener motos para selector
 */
export async function obtenerMotosSelect(): Promise<MotoSelect[]> {
  try {
    const response = await appFetch("/api/motos/select");
    if (response.error || !response.data) return [];
    return (response.data as MotoRaw[]).map((moto) => ({
      placaMot: moto.placaMot,
      marcaMoto: moto.marcaMoto ?? "",
      modeloMot: String(moto.modeloMot),
      nombreCliente: moto.nombreCliente,
    }));
  } catch (error) {
    console.error("Error obteniendo motos:", error);
    return [];
  }
}

/**
 * Obtener productos activos para selector
 */
export async function obtenerProductosSelect(): Promise<ProductoSelect[]> {
  try {
    const response = await appFetch("/api/productos?activos_solo=true");
    if (response.error || !response.data) return [];

    // Mapear la respuesta del backend al formato esperado
    return (response.data as ProductoRaw[]).map((producto) => {
      // Calcular el total de impuestos sumando todos los porcentajes
      const totalImpuestos = producto.impuestos?.reduce(
        (sum, impuesto) => sum + (impuesto.porcentaje || 0),
        0
      ) || 0;

      // Calcular el precio con impuesto: precio_base * (1 + total_impuestos/100)
      const precioConImpuesto = Math.round(
        producto.precioPro * (1 + totalImpuestos / 100)
      );

      return {
        codPro: producto.codPro,
        nombrePro: producto.nombrePro,
        tipoPro: producto.tipoPro,
        precioPro: producto.precioPro,
        precioConImpuesto: precioConImpuesto,
        stockPro: producto.stockPro,
      };
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
}

/**
 * Obtener usuarios (mecánicos) para selector
 */
export async function obtenerUsuariosSelect(): Promise<UsuarioSelect[]> {
  try {
    const response = await appFetch("/api/usuarios/select");
    if (response.error || !response.data) {
      return [];
    }
    const usuarios = (response.data as UsuarioSelectRaw[]).map((usuario) => ({
      documentoUsu: usuario.documentoUsu,
      nombreCompleto: usuario.nombreCompleto,
      esAdminUsu: usuario.esAdminUsu,
    }));
    return usuarios;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
}

/**
 * Obtener estados de orden de trabajo
 */
export async function obtenerEstadosOt(): Promise<OtEstado[]> {
  try {
    const response = await appFetch("/api/ordenes-trabajo/estados");
    if (response.error || !response.data) return [];

    // El backend devuelve en camelCase
    return (response.data as EstadoOtRaw[]).map((estado) => ({
      codOtEst: estado.codOtEst,
      nombreOtEst: estado.nombreOtEst,
      descripcionOtEst: estado.descripcionOtEst,
    }));
  } catch (error) {
    console.error("Error obteniendo estados OT:", error);
    return [];
  }
}

/**
 * Obtener clientes para selector
 */
export async function obtenerClientesSelect(): Promise<ClienteSelect[]> {
  try {
    const response = await appFetch("/api/clientes");
    if (response.error || !response.data) return [];

    // Clientes ya viene en camelCase del backend
    return response.data as ClienteSelect[];
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    return [];
  }
}

/**
 * Obtener motos de un cliente específico
 */
export async function obtenerMotosCliente(documentoCli: string): Promise<MotoSelect[]> {
  try {
    const response = await appFetch(`/api/motos/cliente/${documentoCli}`);
    if (response.error || !response.data) return [];

    // Backend devuelve en camelCase
    return (response.data as MotoRaw[]).map((moto) => ({
      placaMot: moto.placaMot,
      marcaMoto: moto.nombreMarca || "Sin marca",
      modeloMot: moto.modeloMot?.toString() || "",
      nombreCliente: undefined,
    }));
  } catch (error) {
    console.error("Error obteniendo motos del cliente:", error);
    return [];
  }
}

/**
 * Crear cliente desde modal (sin redirect)
 * Usado específicamente cuando se crea un cliente desde la orden de trabajo
 */
export async function crearClienteFromModal(data: CreateClienteRequest) {
  const resp = await appFetch<Cliente>("/api/clientes", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // No redirige - el modal maneja el resultado
  return resp;
}

/**
 * Crear moto desde modal (sin redirect)
 * Usado específicamente cuando se crea una moto desde la orden de trabajo
 */
export async function crearMotoFromModal(data: CreateMotoRequest) {
  const resp = await appFetch<Moto>("/api/motos", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // No redirige - el modal maneja el resultado
  return resp;
}

/**
 * Obtener todas las marcas para el selector
 */
export async function obtenerMarcasSelect(): Promise<Marca[]> {
  try {
    const response = await appFetch("/api/marcas");
    if (response.error || !response.data) return [];
    return response.data as Marca[];
  } catch (error) {
    console.error("Error obteniendo marcas:", error);
    return [];
  }
}

/**
 * Obtener todos los usuarios desde el endpoint de administración
 */
export async function obtenerUsuariosAdmin() {
  try {
    const response = await appFetch("/api/admin/users");
    if (response.error || !response.data) return [];

    // El endpoint devuelve { users: [...] }
    const users = (response.data as { users?: UsuarioAdminRaw[] }).users || [];
    return users.map((user) => ({
      documentoUsu: user.documentoUsu.toString(), // Convertir a string
      nombreCompleto: `${user.nombreUsu} ${user.apellido1Usu}${user.apellido2Usu ? ' ' + user.apellido2Usu : ''}`,
      correoUsu: user.correoUsu,
      subIdUsu: user.subIdUsu,
      codPrfUsu: user.codPrfUsu,
      esAdminUsu: user.esAdminUsu,
    }));
  } catch (error) {
    console.error("Error obteniendo usuarios admin:", error);
    return [];
  }
}

/**
 * Obtener el usuario actual logueado basándose en la sesión
 */
export async function obtenerUsuarioActual() {
  try {
    const session = await auth0.getSession();
    if (!session) return null;

    // Obtener todos los usuarios para encontrar el que coincide con el usuario logueado
    const usuarios = await obtenerUsuariosAdmin();

    // Buscar el usuario que coincide con el sub del usuario de Auth0
    const usuarioActual = usuarios.find((u) => u.subIdUsu === session.user.sub);

    if (!usuarioActual) {
      // Fallback: buscar por email (puede no venir en la sesión)
      const email = session.user.email?.toLowerCase();
      const usuarioPorEmail = email
        ? usuarios.find((u) => u.correoUsu.toLowerCase() === email)
        : undefined;

      return usuarioPorEmail || null;
    }

    return usuarioActual;
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    return null;
  }
}
