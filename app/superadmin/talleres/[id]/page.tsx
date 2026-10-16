import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/page-header";
import { obtenerDetalleTaller } from "../../actions";
import NotasTaller from "./notas-taller";
import TallerAcciones from "./taller-acciones";

function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

export default async function TallerDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const codTaller = Number(id);
  const { data: detalle, error } = await obtenerDetalleTaller(codTaller);

  if (error || !detalle) {
    notFound();
  }

  const { taller, pagos, usuarios, notas } = detalle;

  return (
    <>
      <PageHeader title={taller.nombreTal} subtitle="Detalle del taller y acciones de super-admin." />

      <TallerAcciones taller={taller} />

      <div className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">NIT</p>
              <p className="font-medium">{taller.nitTal ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Correo</p>
              <p className="font-medium">{taller.correoTal ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p className="font-medium">{taller.telefonoTal ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estado</p>
              <p className="font-medium">
                <Badge variant="outline">{taller.estadoTal}</Badge>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Precio pactado</p>
              <p className="font-medium">
                {taller.precioSuscTal != null ? formatoCOP(taller.precioSuscTal) : "-"}
                {taller.esFundador && <Badge className="ml-2" variant="secondary">Fundador</Badge>}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Registrado</p>
              <p className="font-medium">{taller.fechaCreacionTal ?? "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de uso</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Órdenes (7 días)</p>
              <p className="font-medium">{taller.ordenesUltimos7Dias}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Órdenes (30 días)</p>
              <p className="font-medium">{taller.ordenesUltimos30Dias}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Usuarios activos</p>
              <p className="font-medium">{taller.usuariosActivos}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Última actividad</p>
              <p className="font-medium">{taller.ultimaActividad ?? "Sin actividad"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {pagos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin pagos registrados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Medio</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.map((pago) => (
                    <TableRow key={pago.codPago}>
                      <TableCell>{pago.fecha}</TableCell>
                      <TableCell>{pago.nombrePlan}</TableCell>
                      <TableCell>{formatoCOP(pago.monto)}</TableCell>
                      <TableCell>
                        {pago.medio}
                        {pago.detalleMedio ? ` (${pago.detalleMedio})` : ""}
                      </TableCell>
                      <TableCell>{pago.estado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {usuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin usuarios.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Último ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.documentoUsu}>
                      <TableCell>{usuario.nombreCompleto}</TableCell>
                      <TableCell>{usuario.rol}</TableCell>
                      <TableCell>{usuario.ultimoIngreso ?? "Nunca"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas internas</CardTitle>
          </CardHeader>
          <CardContent>
            <NotasTaller codTaller={taller.codTaller} notas={notas} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
