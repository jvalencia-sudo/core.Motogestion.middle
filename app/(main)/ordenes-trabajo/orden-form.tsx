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
  marcas: any[];
  isEdit?: boolean;
}

interface DetalleFormRow extends DetalleOrdenTrabajoResponse {
  id: string; // ID temporal para el key de React
  seFactura?: boolean; // Indica si el producto se factura o no (default: true)
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
      fechaFinGarantiaOt: orden?.fechaFinGarantiaOt || "",
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
    }));
    form.setValue("detalles", detallesParaFormulario, { shouldValidate: true });
  }, [detalles, form]);

  // Cargar detalles si estamos editando
  useEffect(() => {
    if (orden && orden.detalles) {
      const detallesConId: DetalleFormRow[] = orden.detalles.map((det, idx) => ({
        ...det,
        id: `existing-${idx}`,
        cantidadDeto: Math.abs(det.cantidadDeto), // Siempre positivo en el estado local
        seFactura: det.cantidadDeto >= 0 ? true : false, // Si cantidad era negativa, no se factura
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      consecutivoOtDeto: (orden as any)?.consecutivoOt || 0,
      // Iniciar vacío - el usuario debe seleccionar el producto y cantidad
      codProDeto: 0,
      valorUnitarioDeto: 0,
      cantidadDeto: 0,
      usuarioConfirmacion: mecanicoSeleccionado || "",
      fechaConfirmacionDeto: undefined,
      nombrePro: "",
      subtotal: 0,
      estadoProducto: "Pendiente",
      seFactura: true, // Por defecto, los productos se facturan
    };
    setDetalles([...detalles, nuevoDetalle]);
  };

  const eliminarDetalle = (id: string) => {
    setDetalles(detalles.filter((d) => d.id !== id));
  };

  const actualizarDetalle = (id: string, campo: string, valor: any) => {
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
    // El valorUnitarioDeto ya incluye el impuesto (es precioConImpuesto)
    // Sumamos TODOS los productos usando valor absoluto para la UI
    return detalles.reduce((total, detalle) => {
      return total + detalle.valorUnitarioDeto * Math.abs(detalle.cantidadDeto);
    }, 0);
  };

  const calcularTotalFacturable = () => {
    // Total que realmente se facturará (solo productos con seFactura !== false)
    return detalles.reduce((total, detalle) => {
      if (detalle.seFactura === false) return total;
      return total + detalle.valorUnitarioDeto * detalle.cantidadDeto;
    }, 0);
  };

  const contarProductosFacturables = () => {
    return detalles.filter(d => d.seFactura !== false).length;
  };

  // Validar si el formulario está completo para habilitar el botón de crear
  const isFormularioCompleto = () => {
    const values = form.getValues();

    // Validar campos obligatorios del formulario
    const camposObligatorios =
      values.placaMotOt &&
      values.kilometrajeIngresoOt > 0 &&
      values.documentoUsuRpOt &&
      values.documentoUsuMcOt;

    // Validar que haya al menos un detalle
    const hayDetalles = detalles.length > 0;

    // Validar que todos los detalles tengan producto y cantidad
    const detallesCompletos = detalles.every(
      (d) => d.codProDeto !== 0 && d.cantidadDeto > 0
    );

    // Validar que ninguna cantidad exceda el stock
    const stockValido = detalles.every((d) => {
      const producto = productos?.find((p) => p.codPro === d.codProDeto);
      return !producto || d.cantidadDeto <= producto.stockPro;
    });

    return camposObligatorios && hayDetalles && detallesCompletos && stockValido;
  };

  async function onSubmit(values: CreateOrdenTrabajoFormData) {
    // Validar que haya al menos un detalle
    if (detalles.length === 0) {
      setError("Debe agregar al menos un producto o servicio a la orden");
      return;
    }

    // Validar que todos los detalles tengan producto y cantidad seleccionados
    const detallesInvalidos = detalles.filter(
      (d) => d.codProDeto === 0 || d.cantidadDeto === 0
    );
    if (detallesInvalidos.length > 0) {
      setError("Todos los productos deben tener un producto y cantidad seleccionados");
      return;
    }

    // Validar que ninguna cantidad exceda el stock disponible
    // SOLO para productos que se facturan (seFactura === true)
    const detallesExcedenStock = detalles.filter((d) => {
      // Si no se factura, no validar stock (se suma de vuelta)
      if (d.seFactura === false) return false;

      const producto = productos?.find((p) => p.codPro === d.codProDeto);
      if (!producto) return false;

      // En modo edición, considerar la cantidad original del producto
      if (isEdit && orden) {
        const detalleOriginal = orden.detalles?.find(det => det.codProDeto === d.codProDeto);
        if (detalleOriginal) {
          // Producto ya existía en la orden
          // Stock disponible = stock actual + cantidad original en la orden
          const stockDisponible = producto.stockPro + Math.abs(detalleOriginal.cantidadDeto);
          return d.cantidadDeto > stockDisponible;
        }
      }

      // En modo creación o para productos nuevos en edición
      return d.cantidadDeto > producto.stockPro;
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
          fechaFinGarantiaOt: values.fechaFinGarantiaOt,
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
            // Producto existente - verificar si cambió la cantidad o el estado de facturación
            const cantidadActual = actual.seFactura === false ? -Math.abs(actual.cantidadDeto) : Math.abs(actual.cantidadDeto);
            const cantidadOriginal = original.cantidadDeto;

            // Comparar tanto la magnitud como el signo
            const cantidadCambio = Math.abs(cantidadActual) !== Math.abs(cantidadOriginal);
            const estadoFacturacionCambio = (cantidadActual < 0) !== (cantidadOriginal < 0);

            if (cantidadCambio || estadoFacturacionCambio) {
              const respActualizar = await actualizarCantidadProducto(
                orden.consecutivoOt,
                actual.codProDeto,
                cantidadActual
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
            const cantidadAEnviar = actual.seFactura === false ? -Math.abs(actual.cantidadDeto) : actual.cantidadDeto;

            const respAgregar = await agregarProductoOrden(
              orden.consecutivoOt,
              actual.codProDeto,
              cantidadAEnviar
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
          // Si no se factura, enviar cantidad negativa
          cantidadDeto: d.seFactura === false ? -Math.abs(d.cantidadDeto) : d.cantidadDeto,
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
              <div className="flex gap-4 items-start">
                <div className="flex-1">
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
                    <PopoverContent className="w-[400px] p-0">
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
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <FormField
                    control={form.control}
                    name="fechaFinGarantiaOt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin de Garantía</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={(() => {
                              const minDate = new Date();
                              minDate.setDate(minDate.getDate() + 30);
                              return `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;
                            })()}
                          />
                        </FormControl>
                        <FormDescription>Debe ser al menos 30 días desde hoy</FormDescription>
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
                        <FormLabel>Usuario Responsable{!isEdit && " *"}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={
                                !field.value ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Selecciona responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usuarios?.filter((u: any) => u.codRolPrfUsu !== 2).map((usuario) => (
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
                        <FormLabel>Mecánico Asignado{!isEdit && " *"}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={
                                !field.value ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Selecciona mecánico" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usuarios?.filter((u: any) => u.codRolPrfUsu === 2).map((usuario) => (
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
                <CardTitle>4. Productos y Servicios</CardTitle>
                <CardDescription>
                  Agrega los productos y servicios realizados en esta orden
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={agregarDetalle}
                  className="w-full"
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

                  // Calcular stock disponible considerando si es edición
                  let stockDisponible = producto?.stockPro || 0;
                  if (isEdit && orden && producto) {
                    const detalleOriginal = orden.detalles?.find(det => det.codProDeto === detalle.codProDeto);
                    if (detalleOriginal) {
                      // Si el producto ya existía, sumar la cantidad original al stock (usar Math.abs por si es negativa)
                      stockDisponible = producto.stockPro + Math.abs(detalleOriginal.cantidadDeto);
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
                              <PopoverContent className="w-[400px] p-0">
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
                                              ${new Intl.NumberFormat("es-CO").format(prod.precioConImpuesto)} - Stock: {prod.stockPro}
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
                              <p className="text-xs text-muted-foreground mt-1">
                                Stock disponible: {stockDisponible}
                                {isEdit && orden && orden.detalles?.find(det => det.codProDeto === detalle.codProDeto) && (
                                  <span className="text-xs text-blue-600 ml-1">
                                    (incluye {Math.abs(orden.detalles.find(det => det.codProDeto === detalle.codProDeto)?.cantidadDeto || 0)} en esta orden)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Cantidad */}
                          <div className="col-span-6 md:col-span-2">
                            <label className="text-sm font-medium">Cantidad *</label>
                            <Input
                              type="number"
                              min="1"
                              max={detalle.seFactura === false ? 99 : (stockDisponible || 99)}
                              placeholder="0"
                              value={detalle.cantidadDeto === 0 ? "" : Math.abs(detalle.cantidadDeto)}
                              onChange={(e) => {
                                const value = e.target.value === "" ? 0 : Number(e.target.value);
                                // Si se factura, validar que no exceda el stock disponible
                                if (detalle.seFactura !== false && value > stockDisponible) {
                                  // No actualizar si excede el stock
                                  return;
                                }
                                actualizarDetalle(detalle.id, "cantidadDeto", value);
                              }}
                              onKeyDown={(e) => {
                                // Prevenir entrada de -, +, e, E, .
                                if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              className={
                                detalle.cantidadDeto === 0 ||
                                (detalle.seFactura !== false && Math.abs(detalle.cantidadDeto) > stockDisponible)
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {detalle.cantidadDeto === 0 && (
                              <p className="text-xs text-red-500 mt-1">
                                La cantidad es obligatoria
                              </p>
                            )}
                            {detalle.seFactura !== false && Math.abs(detalle.cantidadDeto) > 0 && Math.abs(detalle.cantidadDeto) > stockDisponible && (
                              <p className="text-xs text-red-500 mt-1">
                                Excede el stock disponible ({stockDisponible})
                              </p>
                            )}
                            {detalle.seFactura === false && Math.abs(detalle.cantidadDeto) > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                No afecta el inventario (no se factura)
                              </p>
                            )}
                          </div>

                          {/* Precio Unitario */}
                          <div className="col-span-6 md:col-span-3">
                            <label className="text-sm font-medium">P. Unitario</label>
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
                                detalle.valorUnitarioDeto * Math.abs(detalle.cantidadDeto)
                              )}
                              disabled
                              className="bg-muted"
                            />
                          </div>

                          {/* Se factura? (solo en edición) y Botón Eliminar */}
                          <div className="col-span-12 flex items-center justify-between gap-4 pt-2 border-t mt-2">
                            {isEdit ? (
                              <div className="flex items-center gap-3">
                                <Label htmlFor={`factura-${detalle.id}`} className="text-sm font-medium">
                                  ¿Se factura?
                                </Label>
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-xs font-medium transition-colors",
                                    detalle.seFactura ? "text-muted-foreground" : "text-green-600"
                                  )}>
                                    No
                                  </span>
                                  <Switch
                                    id={`factura-${detalle.id}`}
                                    checked={detalle.seFactura ?? true}
                                    onCheckedChange={(checked) => {
                                      actualizarDetalle(detalle.id, "seFactura", checked);
                                    }}
                                  />
                                  <span className={cn(
                                    "text-xs font-medium transition-colors",
                                    detalle.seFactura ? "text-green-600" : "text-muted-foreground"
                                  )}>
                                    Sí
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarDetalle(detalle.id)}
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
                          <span className="text-sm text-muted-foreground">Total a facturar:</span>
                          <span className="font-semibold text-lg">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(calcularTotalFacturable())}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {detalles.length - contarProductosFacturables()} producto{(detalles.length - contarProductosFacturables()) !== 1 ? 's' : ''} no facturado{(detalles.length - contarProductosFacturables()) !== 1 ? 's' : ''}
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
                    Completa todos los campos obligatorios y agrega al menos un producto para crear la orden.
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
