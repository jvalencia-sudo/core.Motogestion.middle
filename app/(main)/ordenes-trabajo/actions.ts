"use server";

import { appFetch } from "@/lib/fetch";
import { permanentRedirect } from "next/navigation";
import {
  OrdenTrabajoResumen,
  OrdenTrabajoResponse,
  CreateOrdenTrabajoRequest,
  UpdateOrdenTrabajoRequest,
  OrdenTrabajoOperationResponse,
  MotoSelect,
  ProductoSelect,
  UsuarioSelect,
  OtEstado,
  ClienteSelect,
} from "@/lib/types/ordenTrabajo";
import { Cliente, CreateClienteRequest } from "@/lib/types/cliente";
import { Moto, CreateMotoRequest } from "@/lib/types/moto";
import { auth0 } from "@/lib/auth0";


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
  const resp = await appFetch("/api/ordenes-trabajo", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/ordenes-trabajo");
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
  cantidadDeto: number
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/productos/${codPro}`, {
    method: "PATCH",
    body: JSON.stringify({ cantidadDeto }),
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
  cantidadDeto: number
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/productos`, {
    method: "POST",
    body: JSON.stringify({
      codProDeto: codPro,
      cantidadDeto: cantidadDeto,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

/**
 * Eliminar producto de orden de trabajo
 */
export async function eliminarProductoOrden(
  consecutivo: number,
  codPro: number
) {
  const resp = await appFetch(`/api/ordenes-trabajo/${consecutivo}/productos/${codPro}`, {
    method: "DELETE",
  });

  return resp;
}

/**
 * Generar PDF de orden de trabajo
 */
export async function generarPdfOrdenTrabajo(consecutivo: number) {
  "use server";

  try {
    // Construir la URL completa del PDF
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const pdfUrl = `${baseUrl}/api/ordenes-trabajo/${consecutivo}/generar-pdf`;

    // Retornar la URL del PDF para que el cliente pueda abrirlo/descargarlo
    return { pdfUrl };
  } catch (error) {
    console.error("Error generando PDF:", error);
    return { error: "Error al generar el PDF" };
  }
}

/**
 * Generar PDF de factura en formato POS
 */
export async function generarFacturaPdfOrdenTrabajo(consecutivo: number) {
  "use server";

  try {
    // Construir la URL completa del PDF de factura
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const pdfUrl = `${baseUrl}/api/ordenes-trabajo/${consecutivo}/generar-factura`;

    // Retornar la URL del PDF para que el cliente pueda abrirlo/descargarlo
    return { pdfUrl };
  } catch (error) {
    console.error("Error generando factura PDF:", error);
    return { error: "Error al generar la factura PDF" };
  }
}

/**
 * Eliminar orden de trabajo
 */
export async function eliminarOrdenTrabajo(consecutivo: number) {
  const resp = await appFetch<OrdenTrabajoOperationResponse>(
    `/api/ordenes-trabajo/${consecutivo}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}

/**
 * Obtener motos para selector
 */
export async function obtenerMotosSelect(): Promise<MotoSelect[]> {
  try {
    const response = await appFetch("/api/motos/select");
    if (response.error || !response.data) return [];
    return (response.data as any[]).map((moto: any) => ({
      placaMot: moto.placaMot,
      marcaMoto: moto.marcaMoto,
      modeloMot: moto.modeloMot,
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
    return (response.data as any[]).map((producto: any) => {
      // Calcular el total de impuestos sumando todos los porcentajes
      const totalImpuestos = producto.impuestos?.reduce(
        (sum: number, impuesto: any) => sum + (impuesto.porcentaje || 0),
        0
      ) || 0;

      // Calcular el precio con impuesto: precio_base * (1 + total_impuestos/100)
      const precioConImpuesto = Math.round(
        producto.precioPro * (1 + totalImpuestos / 100)
      );

      return {
        codPro: producto.codPro,
        nombrePro: producto.nombrePro,
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
    const usuarios = (response.data as any[]).map((usuario: any) => ({
      documentoUsu: usuario.documentoUsu,
      nombreCompleto: usuario.nombreCompleto,
      codRolPrfUsu: usuario.codRolPrfUsu,
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
    return (response.data as any[]).map((estado: any) => ({
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
    return (response.data as any[]).map((moto: any) => ({
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
export async function obtenerMarcasSelect() {
  try {
    const response = await appFetch("/api/marcas");
    if (response.error || !response.data) return [];
    return response.data as any[];
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
    const users = (response.data as any).users || [];
    return users.map((user: any) => ({
      documentoUsu: user.documentoUsu.toString(), // Convertir a string
      nombreCompleto: `${user.nombreUsu} ${user.apellido1Usu}${user.apellido2Usu ? ' ' + user.apellido2Usu : ''}`,
      correoUsu: user.correoUsu,
      subIdUsu: user.subIdUsu,
      codPrfUsu: user.codPrfUsu,
      codRolPrfUsu: user.codRolPrfUsu,
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
    const usuarioActual = usuarios.find((u: any) => u.subIdUsu === session.user.sub);

    if (!usuarioActual) {
      // Fallback: buscar por email
      const usuarioPorEmail = usuarios.find((u: any) =>
        u.correoUsu.toLowerCase() === session.user.email.toLowerCase()
      );

      return usuarioPorEmail || null;
    }

    return usuarioActual;
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    return null;
  }
}
