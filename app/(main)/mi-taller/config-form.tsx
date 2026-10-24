"use client";

import { Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tallerConfigSchema, TallerConfigFormData } from "@/lib/schemas/taller";
import { TallerConfig } from "@/lib/types/taller";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { guardarConfigTaller } from "./actions";
import { LogoUploader } from "./logo-uploader";
import { VistaPreviaPdf } from "./vista-previa-pdf";

const MAX_TEXTO_PIE = 300;
const MAX_TEXTO_CONDICIONES = 1500;
const MAX_TEXTO_PIE_ORDEN = 200;

const MODOS = [
  { value: "HORAS", label: "Por horas (tarifa fija)", hint: "Se cobra horas × tarifa por hora." },
  { value: "LIBRE", label: "Valor libre", hint: "El valor de la mano de obra se define en cada orden." },
] as const;

export default function ConfigForm({ config }: { config: TallerConfig }) {
  const [error, setError] = useState<string>();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoVersion, setLogoVersion] = useState(0);

  const form = useForm<TallerConfigFormData>({
    resolver: zodResolver(tallerConfigSchema),
    defaultValues: {
      modoManoObra: config.modoManoObra,
      tarifaHoraPred: config.tarifaHoraPred,
      telefonoTal: config.telefonoTal ?? "",
      direccionTal: config.direccionTal ?? "",
      textoPieComprobante: config.textoPieComprobante ?? "",
      nombreComercialTal: config.nombreComercialTal ?? "",
      whatsappTal: config.whatsappTal ?? "",
      colorPrincipalTal: config.colorPrincipalTal,
      textoCondicionesTal: config.textoCondicionesTal ?? "",
      textoPieTal: config.textoPieTal ?? "",
      mostrarPreciosUnitariosTal: config.mostrarPreciosUnitariosTal,
      mostrarMecanicoTal: config.mostrarMecanicoTal,
      mostrarFirmaClienteTal: config.mostrarFirmaClienteTal,
      mostrarDetallePublicoTal: config.mostrarDetallePublicoTal,
      horarioAtencionTal: config.horarioAtencionTal ?? "",
      exigirAprobacionCotizacionTal: config.exigirAprobacionCotizacionTal,
    },
  });

  const modo = useWatch({ control: form.control, name: "modoManoObra", defaultValue: config.modoManoObra });
  const textoPie = useWatch({
    control: form.control,
    name: "textoPieComprobante",
    defaultValue: config.textoPieComprobante ?? "",
  });
  const textoCondiciones = useWatch({
    control: form.control,
    name: "textoCondicionesTal",
    defaultValue: config.textoCondicionesTal ?? "",
  });
  const textoPieOrden = useWatch({
    control: form.control,
    name: "textoPieTal",
    defaultValue: config.textoPieTal ?? "",
  });

  async function onSubmit(values: TallerConfigFormData) {
    setLoading(true);
    setError(undefined);
    setOk(false);
    try {
      const resp = await guardarConfigTaller(values);
      if (resp.error) setError(resp.error);
      else setOk(true);
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">
              <Building2 className="mr-1 size-4" /> General
            </TabsTrigger>
            <TabsTrigger value="pdf">
              <FileText className="mr-1 size-4" /> Personalización de la orden
            </TabsTrigger>
          </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="mt-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Datos del taller</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <FormLabel>Nombre</FormLabel>
                  <Input value={config.nombreTal} disabled className="mt-2" />
                </div>
                <div>
                  <FormLabel>NIT</FormLabel>
                  <Input value={config.nitTal ?? "Sin definir"} disabled className="mt-2" />
                </div>
                <div>
                  <FormLabel>Correo</FormLabel>
                  <Input value={config.correoTal ?? "Sin definir"} disabled className="mt-2" />
                </div>
              </div>
              <FormDescription>
                Para cambiar el nombre, NIT o correo del taller escríbenos a soporte.
              </FormDescription>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="telefonoTal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="direccionTal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="horarioAtencionTal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horario de atención</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Lun a sáb · 8:00 a. m. – 6:00 p. m."
                      />
                    </FormControl>
                    <FormDescription>Se muestra en el link público de estado de la orden.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Mano de obra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="modoManoObra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de cobro *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el modo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODOS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {MODOS.find((m) => m.value === field.value)?.hint}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {modo === "HORAS" && (
                <FormField
                  control={form.control}
                  name="tarifaHoraPred"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa por hora (COP) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor por hora usado por defecto al agregar mano de obra.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Comprobante</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="textoPieComprobante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto al pie del comprobante</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      maxLength={MAX_TEXTO_PIE}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Se imprime al final del comprobante de servicio (ej. política de
                    garantía, horario de atención). {(textoPie ?? "").length}/{MAX_TEXTO_PIE}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        </TabsContent>

        {/* PERSONALIZACIÓN DE LA ORDEN (PDF) */}
        <TabsContent value="pdf" className="mt-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Personalización de la orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
              <div className="space-y-4">
                <div>
                  <FormLabel>Logo</FormLabel>
                  <div className="mt-2">
                    <LogoUploader
                      tieneLogo={config.tieneLogo}
                      onChange={() => setLogoVersion((v) => v + 1)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nombreComercialTal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre comercial</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder={config.nombreTal} />
                        </FormControl>
                        <FormDescription>Si lo dejas vacío, se usa &quot;{config.nombreTal}&quot;.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsappTal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="colorPrincipalTal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color principal</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="color"
                            className="h-9 w-14 p-1"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          className="w-32 font-mono"
                          maxLength={7}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textoCondicionesTal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones (garantía, políticas, etc.)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          maxLength={MAX_TEXTO_CONDICIONES}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Se imprime en la orden (carta). {(textoCondiciones ?? "").length}/{MAX_TEXTO_CONDICIONES}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textoPieTal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pie de la orden</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          maxLength={MAX_TEXTO_PIE_ORDEN}
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        {(textoPieOrden ?? "").length}/{MAX_TEXTO_PIE_ORDEN}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="mostrarPreciosUnitariosTal"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch id="mostrar-precios" checked={field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor="mostrar-precios">Mostrar precios unitarios</Label>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mostrarMecanicoTal"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch id="mostrar-mecanico" checked={field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor="mostrar-mecanico">Mostrar mecánico</Label>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mostrarFirmaClienteTal"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch id="mostrar-firma" checked={field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor="mostrar-firma">Mostrar firmas (cliente y taller)</Label>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mostrarDetallePublicoTal"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="mostrar-detalle-publico"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="mostrar-detalle-publico">
                          Mostrar ítems y total en el link público de estado
                        </Label>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exigirAprobacionCotizacionTal"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="exigir-aprobacion"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="exigir-aprobacion">
                          Exigir aprobación del cliente antes de reparar
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div>
                <FormLabel>Vista previa</FormLabel>
                <div className="mt-2">
                  <VistaPreviaPdf control={form.control} logoVersion={logoVersion} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        {ok && (
          <Card className="border-primary mt-4">
            <CardContent className="pt-4 text-primary">
              Configuración guardada correctamente.
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="border-destructive mt-4">
            <CardContent className="pt-4 text-destructive">{error}</CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
