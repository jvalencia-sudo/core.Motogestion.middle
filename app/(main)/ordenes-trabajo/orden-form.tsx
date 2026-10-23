"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createOrdenTrabajoSchema,
  updateOrdenTrabajoSchema,
  CreateOrdenTrabajoFormData,
} from "@/lib/schemas/ordenTrabajo";
import {
  OrdenTrabajoResponse,
  MotoSelect,
  ProductoSelect,
  UsuarioSelect,
  OtEstado,
  DetalleOrdenTrabajoResponse,
  ClienteSelect,
} from "@/lib/types/ordenTrabajo";
import { Marca } from "@/lib/types/marca";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, ChevronsUpDown, X } from "lucide-react";
import PageHeader from "@/components/page-header";
import {
  crearOrdenTrabajo,
  editarOrdenTrabajo,
  obtenerMotosCliente,
  obtenerClientesSelect,
  obtenerUsuarioActual,
  actualizarCantidadProducto,
  agregarProductoOrden,
  eliminarProductoOrden
} from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { CreateClienteDialog } from "./create-cliente-dialog";
import { CreateMotoDialog } from "./create-moto-dialog";

interface OrdenFormProps {
  orden?: OrdenTrabajoResponse;
  clientes: ClienteSelect[];
  productos: ProductoSelect[];
  usuarios: UsuarioSelect[];
  estados: OtEstado[];
  marcas: Marca[];
  isEdit?: boolean;
}

interface DetalleFormRow extends DetalleOrdenTrabajoResponse {
  id: string; // ID temporal para el key de React
}

export default function OrdenForm({
  orden,
  clientes: initialClientes,
  productos,
  usuarios,
  estados,
  marcas,
  isEdit = false,
}: OrdenFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [detalles, setDetalles] = useState<DetalleFormRow[]>([]);

  // Obtener fecha actual en formato local (useMemo para calcularlo una sola vez)
  const fechaHoy = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Estados para el flujo progresivo
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("");
  const [motosCliente, setMotosCliente] = useState<MotoSelect[]>([]);
  const [loadingMotos, setLoadingMotos] = useState(false);
  const [openClienteCombobox, setOpenClienteCombobox] = useState(false);

  // Estados para la modal de crear cliente
  const [openCreateClienteDialog, setOpenCreateClienteDialog] = useState(false);
  const [clientes, setClientes] = useState<ClienteSelect[]>(initialClientes);

  // Estados para la modal de crear moto
  const [openCreateMotoDialog, setOpenCreateMotoDialog] = useState(false);
  const [clienteRecienCreado, setClienteRecienCreado] = useState(false);

  // Estados para controlar los popovers de productos (uno por cada detalle)
  const [openProductoPopovers, setOpenProductoPopovers] = useState<{ [key: string]: boolean }>({});

  // Hook de permisos
  const { hasPermission } = usePermissions();
  // F1-06: marcar "no se cobra" exige un permiso específico -- solo Admin lo
  // tiene por defecto (control de fraude: el stock se descuenta igual).
  const canMarcarNoCobro = hasPermission("marcar_no_cobro:ordenes-trabajo");
  // F1-05: una orden Entregada o Anulada ya resolvió su stock (entregado o
  // devuelto) -- el backend rechaza (400) cualquier cambio de ítems en ese
  // estado; este flag solo evita el viaje inútil deshabilitando los controles.
  const ordenCerrada = isEdit && (orden?.codOtEstOt === 4 || orden?.codOtEstOt === 5);

  const form = useForm<CreateOrdenTrabajoFormData>({
    resolver: zodResolver(isEdit ? updateOrdenTrabajoSchema : createOrdenTrabajoSchema),
    defaultValues: {
      placaMotOt: orden?.placaMot || "",
      kilometrajeIngresoOt: orden?.kilometrajeIngresoOt || 0,
      documentoUsuRpOt: orden?.documentoRecepcionista || "",
      documentoUsuMcOt: orden?.documentoMecanico || "",
      observacionCliOt: orden?.observacionCliOt || "",
      observacionOt: orden?.observacionOt || "",
      fechaElaboracionOt: orden?.fechaElaboracionOt || fechaHoy,
      fechaEntregaOt: orden?.fechaEntregaOt || "",
      codOtEstOt: orden?.codOtEstOt || undefined,
      detalles: [],
    },
  });

  // Cargar el usuario actual y auto-seleccionarlo como responsable
  useEffect(() => {
    async function cargarUsuarioActual() {
      try {
        const usuarioActual = await obtenerUsuarioActual();
        if (usuarioActual && !isEdit) {
          // Auto-seleccionar el usuario actual como responsable
          form.setValue("documentoUsuRpOt", usuarioActual.documentoUsu, {
            shouldValidate: true
          });
        }
      } catch (error) {
        console.error("Error cargando usuario actual:", error);
      }
    }
    cargarUsuarioActual();
  }, [form, isEdit]);

  // Sincronizar detalles con el formulario para la validación de Zod
  useEffect(() => {
    const detallesParaFormulario = detalles.map((d) => ({
      codProDeto: d.codProDeto,
      valorUnitarioDeto: d.valorUnitarioDeto,
      cantidadDeto: d.cantidadDeto,
      cobrarDeto: d.cobrarDeto,
      motivoNoCobroDeto: d.motivoNoCobroDeto ?? undefined,
    }));
    form.setValue("detalles", detallesParaFormulario, { shouldValidate: true });
  }, [detalles, form]);

  // Cargar detalles si estamos editando
  useEffect(() => {
    if (orden && orden.detalles) {
      const detallesConId: DetalleFormRow[] = orden.detalles.map((det, idx) => ({
        ...det,
        id: `existing-${idx}`,
      }));
      setDetalles(detallesConId);
    }
  }, [orden]);

  // Si estamos editando, auto-seleccionar el cliente para que se muestren los pasos 1 y 2
  useEffect(() => {
    if (isEdit && orden?.documentoCli) {
      setClienteSeleccionado(orden.documentoCli);
    }
  }, [isEdit, orden]);

  // Si estamos editando, cargar los valores de usuario responsable y mecánico
  useEffect(() => {
    if (isEdit && orden) {
      if (orden.documentoRecepcionista) {
        form.setValue("documentoUsuRpOt", orden.documentoRecepcionista);
      }
      if (orden.documentoMecanico) {
        form.setValue("documentoUsuMcOt", orden.documentoMecanico);
      }
      if (orden.codOtEstOt) {
        form.setValue("codOtEstOt", orden.codOtEstOt);
      }
    }
  }, [isEdit, orden, form]);

  // Cargar motos del cliente cuando se selecciona un cliente
  useEffect(() => {
    async function cargarMotos() {
      if (clienteSeleccionado) {
        setLoadingMotos(true);
        try {
          const motos = await obtenerMotosCliente(clienteSeleccionado);
          setMotosCliente(motos);
        } catch (error) {
          console.error("Error cargando motos:", error);
          setMotosCliente([]);
        } finally {
          setLoadingMotos(false);
        }
      } else {
        setMotosCliente([]);
      }
    }
    cargarMotos();
  }, [clienteSeleccionado]);

  // Abrir modal de crear moto si el cliente fue recién creado y no tiene motos
  useEffect(() => {
    if (clienteRecienCreado && motosCliente.length === 0 && !loadingMotos) {
      setOpenCreateMotoDialog(true);
    }
  }, [clienteRecienCreado, motosCliente, loadingMotos]);

  // Manejar cuando se crea un nuevo cliente
  const handleClienteCreated = async (documentoCli: string) => {
    try {
      // Recargar la lista de clientes
      const nuevosClientes = await obtenerClientesSelect();
      setClientes(nuevosClientes);

      // Seleccionar automáticamente el cliente recién creado
      setClienteSeleccionado(documentoCli);
      setOpenClienteCombobox(false);

      // Marcar que el cliente fue recién creado
      setClienteRecienCreado(true);
    } catch (error) {
      console.error("Error recargando clientes:", error);
    }
  };

  // Manejar cuando se crea una nueva moto
  const handleMotoCreated = async (placaMot: string) => {
    try {
      // Recargar las motos del cliente
      const nuevasMotos = await obtenerMotosCliente(clienteSeleccionado);
      setMotosCliente(nuevasMotos);

      // Esperar un tick para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Seleccionar automáticamente la moto recién creada
      form.setValue("placaMotOt", placaMot, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

      // Reiniciar el flag de cliente recién creado
      setClienteRecienCreado(false);
    } catch (error) {
      console.error("Error recargando motos:", error);
    }
  };

  const agregarDetalle = () => {
    // Usar el mecánico seleccionado en el formulario (Step 3)
    const mecanicoSeleccionado = form.getValues("documentoUsuMcOt");

    // Generar ID único con timestamp y random para evitar duplicados
    const uniqueId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const nuevoDetalle: DetalleFormRow = {
      id: uniqueId,
      consecutivoOtDeto: orden?.consecutivoOt || 0,
      // Iniciar vacío - el usuario debe seleccionar el producto y cantidad
      codProDeto: 0,
      valorUnitarioDeto: 0,
      cantidadDeto: 0,
      usuarioConfirmacion: mecanicoSeleccionado || "",
      fechaConfirmacionDeto: undefined,
      nombrePro: "",
      subtotal: 0,
      estadoProducto: "Pendiente",
      cobrarDeto: true, // Por defecto, los productos se cobran
      motivoNoCobroDeto: undefined,
    };
    setDetalles([...detalles, nuevoDetalle]);
  };

  const eliminarDetalle = (id: string) => {
    setDetalles(detalles.filter((d) => d.id !== id));
  };

  const actualizarDetalle = (
    id: string,
    campo: string,
    valor: string | number | boolean | undefined,
  ) => {
    setDetalles(
      detalles.map((d) => {
        if (d.id === id) {
          const updated = { ...d, [campo]: valor };

          // Si cambió el producto, actualizar el precio unitario con impuesto incluido
          if (campo === "codProDeto") {
            const producto = productos?.find((p) => p.codPro === Number(valor));
            if (producto) {
              updated.valorUnitarioDeto = producto.precioConImpuesto;
              updated.nombrePro = producto.nombrePro;
            }
          }

          return updated;
        }
        return d;
      })
    );
  };

  const calcularTotal = () => {
    // El valorUnitarioDeto ya incluye el impuesto (es precioConImpuesto).
    // cantidadDeto siempre es positiva (F1-06): el signo ya no se usa.
    return detalles.reduce((total, detalle) => {
      return total + detalle.valorUnitarioDeto * detalle.cantidadDeto;
    }, 0);
  };

  const calcularTotalFacturable = () => {
    // Total que realmente se facturará (solo productos con cobrarDeto !== false)
    return detalles.reduce((total, detalle) => {
      if (detalle.cobrarDeto === false) return total;
      return total + detalle.valorUnitarioDeto * detalle.cantidadDeto;
    }, 0);
  };

  const contarProductosFacturables = () => {
    return detalles.filter((d) => d.cobrarDeto !== false).length;
  };

  // Validar si el formulario está completo para habilitar el botón de crear.
  // F1-01: orden rápida -- mecánico y productos son opcionales ("se agregan
  // después"), así que no bloquean el envío. Si se agregó algún producto, sí
  // debe estar completo (producto + cantidad, sin exceder stock).
  const isFormularioCompleto = () => {
    const values = form.getValues();

    const camposObligatorios =
      values.placaMotOt &&
      values.kilometrajeIngresoOt > 0;

    const detallesCompletos = detalles.every(
      (d) => d.codProDeto !== 0 && d.cantidadDeto > 0
    );

    // F1-06: si no se cobra, el motivo es obligatorio.
    const motivosCompletos = detalles.every(
      (d) => d.cobrarDeto !== false || !!d.motivoNoCobroDeto?.trim()
    );

    // Validar que ninguna cantidad exceda el stock (solo BIEN maneja stock;
    // SERVICIO/PAQUETE no validan stock aquí). F1-06: una cortesía también
    // descuenta stock, así que también debe respetar el disponible.
    const stockValido = detalles.every((d) => {
      const producto = productos?.find((p) => p.codPro === d.codProDeto);
      if (!producto || producto.tipoPro !== "BIEN") return true;
      return d.cantidadDeto <= (producto.stockPro ?? 0);
    });

    return camposObligatorios && detallesCompletos && motivosCompletos && stockValido;
  };

  async function onSubmit(values: CreateOrdenTrabajoFormData) {
    // F1-01: orden rápida -- ya no se exige al menos un producto para crear
    // (se pueden agregar después). El backend sí rechaza pasar a Completada o
    // Entregada sin ítems; ese error llega por resp.error más abajo.

    // Validar que todos los detalles tengan producto y cantidad seleccionados
    const detallesInvalidos = detalles.filter(
      (d) => d.codProDeto === 0 || d.cantidadDeto === 0
    );
    if (detallesInvalidos.length > 0) {
      setError("Todos los productos deben tener un producto y cantidad seleccionados");
      return;
    }

    // F1-06: si no se cobra, el motivo es obligatorio (mismo chequeo que el backend).
    const detallesSinMotivo = detalles.filter(
      (d) => d.cobrarDeto === false && !d.motivoNoCobroDeto?.trim()
    );
    if (detallesSinMotivo.length > 0) {
      setError("Los productos marcados como 'no se cobra' deben tener un motivo");
      return;
    }

    // Validar que ninguna cantidad exceda el stock disponible. F1-06: una
    // cortesía también descuenta stock real, así que también se valida.
    const detallesExcedenStock = detalles.filter((d) => {
      const producto = productos?.find((p) => p.codPro === d.codProDeto);
      if (!producto) return false;
      // SERVICIO/PAQUETE no manejan stock: nunca exceden.
      if (producto.tipoPro !== "BIEN") return false;
      const stockActual = producto.stockPro ?? 0;

      // En modo edición, considerar la cantidad original del producto
      if (isEdit && orden) {
        const detalleOriginal = orden.detalles?.find(det => det.codProDeto === d.codProDeto);
        if (detalleOriginal) {
          // Producto ya existía en la orden
          // Stock disponible = stock actual + cantidad original en la orden
          const stockDisponible = stockActual + detalleOriginal.cantidadDeto;
          return d.cantidadDeto > stockDisponible;
        }
      }

      // En modo creación o para productos nuevos en edición
      return d.cantidadDeto > stockActual;
    });
    if (detallesExcedenStock.length > 0) {
      setError("Una o más cantidades exceden el stock disponible");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      if (isEdit && orden) {
        // MODO EDICIÓN: Actualizar orden y gestionar productos por separado

        // 1. Actualizar datos de la orden (sin detalles)
        const ordenData = {
          fechaEntregaOt: values.fechaEntregaOt,
          observacionOt: values.observacionOt,
          codOtEstOt: values.codOtEstOt,
          documentoUsuRpOt: values.documentoUsuRpOt,
          documentoUsuMcOt: values.documentoUsuMcOt,
        };

        const respOrden = await editarOrdenTrabajo(orden.consecutivoOt, ordenData);

        if (respOrden?.error) {
          setError(respOrden.error);
          setLoading(false);
          return;
        }

        // 2. Gestionar cambios en productos/servicios
        const detallesOriginales = orden.detalles || [];
        const detallesActuales = detalles;

        // 2.1 Detectar productos eliminados
        for (const original of detallesOriginales) {
          const existe = detallesActuales.find(d => d.codProDeto === original.codProDeto);

          if (!existe) {
            const respEliminar = await eliminarProductoOrden(orden.consecutivoOt, original.codProDeto);

            if (respEliminar?.error) {
              setError(`Error al eliminar producto ${original.nombrePro}: ${respEliminar.error}`);
              setLoading(false);
              return;
            }
          }
        }

        // 2.2 Detectar productos modificados y nuevos
        for (const actual of detallesActuales) {
          const original = detallesOriginales.find(d => d.codProDeto === actual.codProDeto);

          if (original) {
            // Producto existente - verificar si cambió la cantidad o el estado de cobro
            const cobrarActual = actual.cobrarDeto ?? true;
            const cambioCantidad = actual.cantidadDeto !== original.cantidadDeto;
            const cambioCobro =
              cobrarActual !== (original.cobrarDeto ?? true) ||
              (actual.motivoNoCobroDeto ?? "") !== (original.motivoNoCobroDeto ?? "");

            if (cambioCantidad || cambioCobro) {
              const respActualizar = await actualizarCantidadProducto(
                orden.consecutivoOt,
                actual.codProDeto,
                actual.cantidadDeto,
                cobrarActual,
                actual.motivoNoCobroDeto ?? undefined
              );

              if (respActualizar?.error) {
                setError(`Error al actualizar cantidad de producto: ${respActualizar.error}`);
                setLoading(false);
                return;
              }
            }
          } else {
            // Producto nuevo - agregar a la orden
            const productoInfo = productos?.find(p => p.codPro === actual.codProDeto);

            const respAgregar = await agregarProductoOrden(
              orden.consecutivoOt,
              actual.codProDeto,
              actual.cantidadDeto,
              actual.cobrarDeto ?? true,
              actual.motivoNoCobroDeto ?? undefined
            );

            if (respAgregar?.error) {
              setError(`Error al agregar producto ${productoInfo?.nombrePro}: ${respAgregar.error}`);
              setLoading(false);
              return;
            }
          }
        }

        // Si todo salió bien, redirigir
        router.push("/ordenes-trabajo");

      } else {
        // MODO CREACIÓN: Enviar todo junto
        const detallesRequest = detalles.map((d) => ({
          codProDeto: d.codProDeto,
          valorUnitarioDeto: d.valorUnitarioDeto,
          cantidadDeto: d.cantidadDeto,
          cobrarDeto: d.cobrarDeto ?? true,
          motivoNoCobroDeto: d.motivoNoCobroDeto ?? undefined,
        }));

        const data = {
          ...values,
          detalles: detallesRequest,
        };

        const resp = await crearOrdenTrabajo(data);

        if (resp?.error) {
          setError(resp.error);
          setLoading(false);
        }
        // Si no hay error, la función crearOrdenTrabajo hace redirect automáticamente
      }
    } catch (err) {
      console.error("Error en onSubmit:", err);
      setError("Ocurrió un error inesperado al procesar la orden");
      setLoading(false);
    }
  }

  const clienteInfo = clientes?.find((c) => c.documentoCli === clienteSeleccionado);
  const motoSeleccionada = motosCliente?.find(
    (m) => m.placaMot === form.watch("placaMotOt")
  );

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar orden de trabajo" : "Crear orden de trabajo"}
        subtitle={
          isEdit
            ? `Editando orden #${orden?.consecutivoOt}`
            : "Crear una nueva orden de trabajo para una moto"
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* CARD 1: Selección de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>1. Seleccionar Cliente</CardTitle>
              <CardDescription>
                Selecciona el cliente propietario de la moto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-start">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium">Cliente *</label>
                  <Popover open={openClienteCombobox} onOpenChange={setOpenClienteCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClienteCombobox}
                        className="w-full justify-between"
                        disabled={isEdit}
                      >
                        {clienteSeleccionado
                          ? clientes?.find((c) => c.documentoCli === clienteSeleccionado)
                              ?.nombreCompleto + " - " + clienteSeleccionado
                          : "Selecciona un cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[90vw] max-w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente por nombre o documento..." />
                        <CommandList>
                          <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                          <CommandGroup>
                            {clientes?.map((cliente) => (
                              <CommandItem
                                key={cliente.documentoCli}
                                value={`${cliente.nombreCompleto} ${cliente.documentoCli}`}
                                onSelect={() => {
                                  setClienteSeleccionado(cliente.documentoCli);
                                  setOpenClienteCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    clienteSeleccionado === cliente.documentoCli
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="font-medium">{cliente.nombreCompleto}</span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  - {cliente.documentoCli}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="pt-6">
                  {hasPermission("Ver Clientes") && !isEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenCreateClienteDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Cliente
                    </Button>
                  )}
                </div>
              </div>

              {clienteInfo && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Información del Cliente</h4>
                  <p className="text-sm">
                    <span className="font-medium">Nombre:</span> {clienteInfo.nombreCompleto}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Teléfono:</span> {clienteInfo.telefonoCli}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: Selección de Moto */}
          {clienteSeleccionado && (
            <Card>
              <CardHeader>
                <CardTitle>2. Seleccionar Moto</CardTitle>
                <CardDescription>
                  Selecciona la moto que ingresa al taller
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-start">
                  <div className="flex-1 min-w-[200px]">
                    <FormField
                      control={form.control}
                      name="placaMotOt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moto (Placa){!isEdit && " *"}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isEdit || loadingMotos}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    loadingMotos
                                      ? "Cargando motos..."
                                      : motosCliente.length === 0
                                      ? "No hay motos registradas para este cliente"
                                      : "Selecciona una moto"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {motosCliente?.map((moto) => (
                                <SelectItem key={moto.placaMot} value={moto.placaMot}>
                                  <span className="font-mono font-semibold">
                                    {moto.placaMot}
                                  </span>{" "}
                                  - {moto.marcaMoto} {moto.modeloMot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="pt-8">
                    {hasPermission("Ver Motos") && !isEdit ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenCreateMotoDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Moto
                      </Button>
                    ) : !isEdit ? (
                      <p className="text-xs text-muted-foreground pt-2">
                        No tienes permiso para crear motos
                      </p>
                    ) : null}
                  </div>
                </div>

                {motoSeleccionada && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Información de la Moto</h4>
                    <p className="text-sm">
                      <span className="font-medium">Placa:</span> {motoSeleccionada.placaMot}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Marca:</span> {motoSeleccionada.marcaMoto}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Modelo:</span> {motoSeleccionada.modeloMot}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* CARD 3: Información de la Orden */}
          {form.watch("placaMotOt") && (
            <Card>
              <CardHeader>
                <CardTitle>3. Información de la Orden</CardTitle>
                <CardDescription>
                  Completa los datos de la orden de trabajo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kilometrajeIngresoOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kilometraje de Ingreso{!isEdit && " *"}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            value={field.value ? field.value.toLocaleString('es-ES') : ''}
                            onChange={(e) => {
                              // Solo permitir números y eliminar formato
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              const numValue = value ? parseInt(value) : 0;
                              // Solo actualizar si es menor o igual a 999999
                              if (numValue <= 999999) {
                                field.onChange(numValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              // Prevenir entrada de -, +, e, E, .
                              if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className={
                              field.value === 0 || !field.value
                                ? "border-red-500"
                                : ""
                            }
                            disabled={isEdit}
                          />
                        </FormControl>
                        <FormDescription>Kilometraje al ingresar al taller (máx. 999,999)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaElaboracionOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Elaboración{!isEdit && " *"}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            readOnly
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                        </FormControl>
                        <FormDescription>Fecha del día de hoy (no modificable)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaEntregaOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Entrega Estimada</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={fechaHoy}
                          />
                        </FormControl>
                        <FormDescription>No se puede seleccionar una fecha pasada</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="documentoUsuRpOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario Responsable</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Usuario autenticado (por defecto)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usuarios?.map((usuario) => (
                              <SelectItem
                                key={usuario.documentoUsu}
                                value={usuario.documentoUsu}
                              >
                                {usuario.nombreCompleto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentoUsuMcOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mecánico Asignado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sin asignar (se puede agregar después)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usuarios?.map((usuario) => (
                              <SelectItem
                                key={usuario.documentoUsu}
                                value={usuario.documentoUsu}
                              >
                                {usuario.nombreCompleto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codOtEstOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado{!isEdit && " *"}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estados?.map((estado) => (
                              <SelectItem
                                key={estado.codOtEst}
                                value={estado.codOtEst.toString()}
                              >
                                {estado.nombreOtEst}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacionCliOt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observación del Cliente</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Motivo del ingreso, problemas reportados, etc."
                          rows={3}
                          disabled={isEdit}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacionOt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones del Taller</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Diagnóstico, trabajos realizados, recomendaciones..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* CARD 4: Productos/Servicios */}
          {form.watch("placaMotOt") && (
            <Card>
              <CardHeader>
                <CardTitle>4. Productos y Servicios (opcional)</CardTitle>
                <CardDescription>
                  Puedes agregarlos ahora o después, antes de marcar la orden como Completada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordenCerrada && (
                  <Alert>
                    <AlertDescription>
                      Esta orden está {orden?.codOtEstOt === 5 ? "anulada" : "entregada"} -- ya
                      no se pueden agregar, editar ni quitar productos o servicios.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={agregarDetalle}
                  className="w-full"
                  disabled={ordenCerrada}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto/Servicio
                </Button>

                {detalles.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No hay productos agregados. Haz clic en el botón para agregar.
                  </p>
                )}

                {detalles.map((detalle) => {
                  const producto = productos?.find(
                    (p) => p.codPro === detalle.codProDeto
                  );
                  // Solo los BIEN manejan stock; SERVICIO (mano de obra) y PAQUETE no.
                  const esBien = producto?.tipoPro === "BIEN";

                  // Calcular stock disponible considerando si es edición (solo BIEN)
                  let stockDisponible = producto?.stockPro ?? 0;
                  if (isEdit && orden && producto && esBien) {
                    const detalleOriginal = orden.detalles?.find(det => det.codProDeto === detalle.codProDeto);
                    if (detalleOriginal) {
                      // Si el producto ya existía, sumar la cantidad original al stock
                      stockDisponible = (producto.stockPro ?? 0) + detalleOriginal.cantidadDeto;
                    }
                  }

                  // Filtrar productos ya seleccionados en otros detalles
                  const productosDisponibles = productos?.filter((prod) => {
                    // Incluir el producto actual del detalle
                    if (prod.codPro === detalle.codProDeto) return true;
                    // Excluir productos ya seleccionados en otros detalles (pero ignorar codProDeto === 0 que significa vacío)
                    return !detalles.some(
                      (d) => d.id !== detalle.id && d.codProDeto === prod.codPro && d.codProDeto !== 0
                    );
                  });

                  return (
                    <Card key={detalle.id} className="border-2">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-4 items-start">
                          {/* Producto */}
                          <div className="col-span-12 md:col-span-4">
                            <label className="text-sm font-medium">Producto/Servicio *</label>
                            <Popover
                              open={openProductoPopovers[detalle.id] || false}
                              onOpenChange={(open) => {
                                setOpenProductoPopovers(prev => ({
                                  ...prev,
                                  [detalle.id]: open
                                }));
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  disabled={ordenCerrada}
                                  className={`w-full justify-between font-normal ${
                                    detalle.codProDeto === 0 ? "border-red-500" : ""
                                  }`}
                                >
                                  {detalle.codProDeto !== 0
                                    ? productosDisponibles?.find(
                                        (p) => p.codPro === detalle.codProDeto
                                      )?.nombrePro
                                    : "Selecciona un producto"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[90vw] max-w-[400px] p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar producto..." />
                                  <CommandList>
                                    <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                    <CommandGroup>
                                      {productosDisponibles?.map((prod) => (
                                        <CommandItem
                                          key={prod.codPro}
                                          value={`${prod.nombrePro} ${prod.codPro}`}
                                          onSelect={() => {
                                            actualizarDetalle(detalle.id, "codProDeto", prod.codPro);
                                            // Cerrar el popover después de seleccionar
                                            setOpenProductoPopovers(prev => ({
                                              ...prev,
                                              [detalle.id]: false
                                            }));
                                          }}
                                        >
                                          <Check
                                            className={
                                              detalle.codProDeto === prod.codPro
                                                ? "mr-2 h-4 w-4 opacity-100"
                                                : "mr-2 h-4 w-4 opacity-0"
                                            }
                                          />
                                          <div className="flex flex-col">
                                            <span>{prod.nombrePro}</span>
                                            <span className="text-xs text-muted-foreground">
                                              ${new Intl.NumberFormat("es-CO").format(prod.precioConImpuesto)}
                                              {prod.tipoPro === "BIEN"
                                                ? ` - Stock: ${prod.stockPro ?? 0}`
                                                : prod.tipoPro === "SERVICIO"
                                                ? " - Servicio"
                                                : " - Paquete"}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {detalle.codProDeto === 0 ? (
                              <p className="text-xs text-red-500 mt-1">
                                El producto es obligatorio
                              </p>
                            ) : producto && (
                              esBien ? (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Stock disponible: {stockDisponible}
                                  {isEdit && orden && orden.detalles?.find(det => det.codProDeto === detalle.codProDeto) && (
                                    <span className="text-xs text-blue-600 ml-1">
                                      (incluye {orden.detalles.find(det => det.codProDeto === detalle.codProDeto)?.cantidadDeto || 0} en esta orden)
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {producto.tipoPro === "SERVICIO"
                                    ? "Servicio (mano de obra) — sin stock; la cantidad son horas/unidades"
                                    : "Paquete (combo) — descuenta el stock de sus componentes"}
                                </p>
                              )
                            )}
                          </div>

                          {/* Cantidad */}
                          <div className="col-span-6 md:col-span-2">
                            <label className="text-sm font-medium">Cantidad *</label>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              max={esBien ? (stockDisponible || 99999) : 99}
                              placeholder="0"
                              disabled={ordenCerrada}
                              value={detalle.cantidadDeto === 0 ? "" : detalle.cantidadDeto}
                              onChange={(e) => {
                                const value = e.target.value === "" ? 0 : Number(e.target.value);
                                // F1-03/F1-06: toda cantidad de un BIEN (se cobre o no) valida
                                // stock -- una cortesía también descuenta inventario real.
                                if (esBien && value > stockDisponible) {
                                  return;
                                }
                                actualizarDetalle(detalle.id, "cantidadDeto", value);
                              }}
                              onKeyDown={(e) => {
                                if (['-', '+', 'e', 'E'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              className={
                                detalle.cantidadDeto === 0 ||
                                (esBien && detalle.cantidadDeto > stockDisponible)
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {detalle.cantidadDeto === 0 && (
                              <p className="text-xs text-red-500 mt-1">
                                La cantidad es obligatoria
                              </p>
                            )}
                            {esBien && detalle.cantidadDeto > 0 && detalle.cantidadDeto > stockDisponible && (
                              <p className="text-xs text-red-500 mt-1">
                                Excede el stock disponible ({stockDisponible})
                              </p>
                            )}
                            {detalle.cobrarDeto === false && detalle.cantidadDeto > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                Sin costo para el cliente
                              </p>
                            )}
                          </div>

                          {/* Precio Unitario. Editable para SERVICIO (mano de obra en
                              modo LIBRE); fijo para BIEN y PAQUETE. */}
                          <div className="col-span-6 md:col-span-3">
                            <label className="text-sm font-medium">P. Unitario</label>
                            {producto?.tipoPro === "SERVICIO" ? (
                              <Input
                                type="text"
                                disabled={ordenCerrada}
                                value={new Intl.NumberFormat("es-CO").format(
                                  detalle.valorUnitarioDeto || 0
                                )}
                                onChange={(e) => {
                                  const value = Number(e.target.value.replace(/\D/g, "")) || 0;
                                  actualizarDetalle(detalle.id, "valorUnitarioDeto", value);
                                }}
                              />
                            ) : (
                              <Input
                                type="text"
                                value={new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  minimumFractionDigits: 0,
                                }).format(detalle.valorUnitarioDeto)}
                                disabled
                                className="bg-muted"
                              />
                            )}
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-10 md:col-span-3">
                            <label className="text-sm font-medium">Subtotal</label>
                            <Input
                              type="text"
                              value={new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                              }).format(
                                detalle.valorUnitarioDeto * detalle.cantidadDeto
                              )}
                              disabled
                              className="bg-muted"
                            />
                          </div>

                          {/* ¿Se cobra? (gateado por permiso) y Botón Eliminar */}
                          <div className="col-span-12 flex items-start justify-between gap-4 pt-2 border-t mt-2">
                            {canMarcarNoCobro ? (
                              <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <Label htmlFor={`cobrar-${detalle.id}`} className="text-sm font-medium">
                                    ¿Se cobra?
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "text-xs font-medium transition-colors",
                                      detalle.cobrarDeto ?? true ? "text-muted-foreground" : "text-green-600"
                                    )}>
                                      No
                                    </span>
                                    <Switch
                                      id={`cobrar-${detalle.id}`}
                                      checked={detalle.cobrarDeto ?? true}
                                      disabled={ordenCerrada}
                                      onCheckedChange={(checked) => {
                                        actualizarDetalle(detalle.id, "cobrarDeto", checked);
                                        if (checked) {
                                          actualizarDetalle(detalle.id, "motivoNoCobroDeto", undefined);
                                        }
                                      }}
                                    />
                                    <span className={cn(
                                      "text-xs font-medium transition-colors",
                                      detalle.cobrarDeto ?? true ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                      Sí
                                    </span>
                                  </div>
                                </div>
                                {detalle.cobrarDeto === false && (
                                  <div className="max-w-sm">
                                    <Input
                                      placeholder="Motivo de la cortesía (obligatorio)"
                                      value={detalle.motivoNoCobroDeto ?? ""}
                                      maxLength={200}
                                      disabled={ordenCerrada}
                                      onChange={(e) =>
                                        actualizarDetalle(detalle.id, "motivoNoCobroDeto", e.target.value)
                                      }
                                      className={!detalle.motivoNoCobroDeto?.trim() ? "border-red-500" : ""}
                                    />
                                    {!detalle.motivoNoCobroDeto?.trim() && (
                                      <p className="text-xs text-red-500 mt-1">El motivo es obligatorio</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div></div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarDetalle(detalle.id)}
                              disabled={ordenCerrada}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Resumen Total */}
                {detalles.length > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-lg">Total de la Orden:</h4>
                      <span className="font-bold text-2xl">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(calcularTotal())}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {detalles.length} producto{detalles.length !== 1 ? 's' : ''} • Impuestos incluidos
                    </p>
                    {contarProductosFacturables() < detalles.length && (
                      <div className="pt-2 border-t border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total a cobrar:</span>
                          <span className="font-semibold text-lg">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(calcularTotalFacturable())}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {detalles.length - contarProductosFacturables()} producto{(detalles.length - contarProductosFacturables()) !== 1 ? 's' : ''} sin costo
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          {form.watch("placaMotOt") && (
            <div className="flex flex-col gap-4">
              {!isFormularioCompleto() && (
                <Alert>
                  <AlertDescription>
                    Completa la placa y el kilometraje para crear la orden. El mecánico y los
                    productos se pueden agregar después.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading || !isFormularioCompleto()}
                  className="flex-1"
                >
                  {loading ? "Guardando..." : isEdit ? "Actualizar Orden" : "Crear Orden"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>

      {/* Modal para crear cliente */}
      <CreateClienteDialog
        open={openCreateClienteDialog}
        onOpenChange={setOpenCreateClienteDialog}
        onClienteCreated={handleClienteCreated}
      />

      {/* Modal para crear moto */}
      <CreateMotoDialog
        open={openCreateMotoDialog}
        onOpenChange={setOpenCreateMotoDialog}
        onMotoCreated={handleMotoCreated}
        documentoCli={clienteSeleccionado}
        marcas={marcas}
      />
    </>
  );
}
