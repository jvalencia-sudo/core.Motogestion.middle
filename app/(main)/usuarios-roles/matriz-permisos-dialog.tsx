"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PerfilDetallado } from "@/lib/types/auth/perfil";
import { Permiso } from "@/lib/types/auth/permiso";
import { obtenerPermisosAsignados, reemplazarPermisos } from "./actions";
import { ORDEN_MODULOS, ubicarEnMatriz, AccionColumna, PERMISOS_SENSIBLES } from "@/lib/permisos-modulos";
import { PLANTILLA_MECANICO, PLANTILLA_RECEPCION } from "@/lib/permisos-plantillas";
import { useRouter } from "next/navigation";

const VERBO: Record<string, string> = {
  ver: "ver",
  crear_editar: "crear y editar",
  eliminar_o_anular: "eliminar o anular",
};

function recursoLegible(recurso: string): string {
  return recurso.replace(/-/g, " ");
}

interface Props {
  perfil: PerfilDetallado;
  catalogo: Permiso[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Matriz[modulo][columna] -> lista de cod_prm que esa celda representa (la
// columna "Crear y editar" agrupa crear+actualizar en una sola casilla).
type Matriz = Record<string, Partial<Record<AccionColumna, number[]>>>;

export default function MatrizPermisosDialog({ perfil, catalogo, open, onOpenChange }: Props) {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>();
  const [original, setOriginal] = useState<Set<number>>(new Set());
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    setCargando(true);
    setError(undefined);
    obtenerPermisosAsignados(perfil.codPrf).then((resp) => {
      if (cancelado) return;
      if (resp.error || !resp.data) {
        setError(resp.error || "No se pudieron cargar los permisos del rol.");
      } else {
        const asignados = new Set(resp.data.map((p) => p.codPrm));
        setOriginal(asignados);
        setSeleccion(new Set(asignados));
      }
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [open, perfil.codPrf]);

  const matriz = useMemo<Matriz>(() => {
    const m: Matriz = {};
    for (const permiso of catalogo) {
      const ubicacion = ubicarEnMatriz(permiso.nombrePrm);
      if (!ubicacion) continue;
      const { modulo, columna } = ubicacion;
      if (!m[modulo]) m[modulo] = {};
      if (!m[modulo][columna]) m[modulo][columna] = [];
      m[modulo][columna]!.push(permiso.codPrm);
    }
    return m;
  }, [catalogo]);

  const nombrePorCodPrm = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of catalogo) map.set(p.codPrm, p.nombrePrm);
    return map;
  }, [catalogo]);

  // Acciones sensibles (F1-05/F1-12): fuera de la grilla, un switch por
  // permiso. Solo se listan las que de verdad existen en el catálogo.
  const sensiblesDisponibles = useMemo(() => {
    const idPorNombre = new Map(catalogo.map((p) => [p.nombrePrm, p.codPrm]));
    return PERMISOS_SENSIBLES.flatMap(({ nombrePrm, etiqueta }) => {
      const codPrm = idPorNombre.get(nombrePrm);
      return codPrm === undefined ? [] : [{ codPrm, etiqueta }];
    });
  }, [catalogo]);

  function alternarSensible(codPrm: number) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(codPrm)) next.delete(codPrm);
      else next.add(codPrm);
      return next;
    });
  }

  function celdaMarcada(modulo: string, columna: AccionColumna): boolean {
    const ids = matriz[modulo]?.[columna];
    if (!ids || ids.length === 0) return false;
    return ids.every((id) => seleccion.has(id));
  }

  function alternarCelda(modulo: string, columna: AccionColumna) {
    const ids = matriz[modulo]?.[columna];
    if (!ids || ids.length === 0) return;
    const marcar = !celdaMarcada(modulo, columna);
    setSeleccion((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (marcar) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function aplicarPlantilla(nombres: string[]) {
    const idsPorNombre = new Map(catalogo.map((p) => [p.nombrePrm, p.codPrm]));
    const next = new Set<number>();
    for (const nombre of nombres) {
      const id = idsPorNombre.get(nombre);
      if (id !== undefined) next.add(id);
    }
    setSeleccion(next);
  }

  const etiquetaSensiblePorNombre = useMemo(() => {
    const map = new Map<string, string>();
    for (const { nombrePrm, etiqueta } of PERMISOS_SENSIBLES) map.set(nombrePrm, etiqueta);
    return map;
  }, []);

  const describirPermiso = useCallback(
    (nombre: string): string => {
      const sensible = etiquetaSensiblePorNombre.get(nombre);
      if (sensible) return sensible.charAt(0).toLowerCase() + sensible.slice(1);
      const [accion, recurso] = nombre.split(":");
      return `${VERBO[accion] ?? accion} ${recursoLegible(recurso)}`;
    },
    [etiquetaSensiblePorNombre],
  );

  const resumenCambios = useMemo(() => {
    const frases: string[] = [];
    for (const id of seleccion) {
      if (original.has(id)) continue;
      const nombre = nombrePorCodPrm.get(id);
      if (!nombre) continue;
      frases.push(`${perfil.nombrePrf} podrá ${describirPermiso(nombre)}`);
    }
    for (const id of original) {
      if (seleccion.has(id)) continue;
      const nombre = nombrePorCodPrm.get(id);
      if (!nombre) continue;
      frases.push(`${perfil.nombrePrf} ya no podrá ${describirPermiso(nombre)}`);
    }
    return frases;
  }, [seleccion, original, nombrePorCodPrm, perfil.nombrePrf, describirPermiso]);

  const router = useRouter();

  async function guardar() {
    setGuardando(true);
    setError(undefined);
    const resp = await reemplazarPermisos(perfil.codPrf, {
      codPrmList: Array.from(seleccion),
    });
    setGuardando(false);
    if (resp.error) {
      setError(resp.error);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permisos de {perfil.nombrePrf}</DialogTitle>
          <DialogDescription>
            Marca lo que este rol puede hacer en cada módulo y guarda una sola vez.
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => aplicarPlantilla(PLANTILLA_RECEPCION)}
              >
                Plantilla: Recepción
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => aplicarPlantilla(PLANTILLA_MECANICO)}
              >
                Plantilla: Mecánico
              </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="text-center">Ver</TableHead>
                    <TableHead className="text-center">Crear y editar</TableHead>
                    <TableHead className="text-center">Eliminar o anular</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ORDEN_MODULOS.filter((modulo) => matriz[modulo]).map((modulo) => (
                    <TableRow key={modulo}>
                      <TableCell className="font-medium">{modulo}</TableCell>
                      {(["ver", "crear_editar", "eliminar_o_anular"] as AccionColumna[]).map(
                        (columna) => (
                          <TableCell key={columna} className="text-center">
                            {matriz[modulo]?.[columna] ? (
                              <Checkbox
                                checked={celdaMarcada(modulo, columna)}
                                onCheckedChange={() => alternarCelda(modulo, columna)}
                              />
                            ) : null}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sensiblesDisponibles.length > 0 && (
              <div className="flex flex-col gap-3 rounded-md border p-3">
                <p className="text-sm font-medium">Permisos especiales</p>
                {sensiblesDisponibles.map(({ codPrm, etiqueta }) => (
                  <div key={codPrm} className="flex items-center justify-between gap-3">
                    <Label htmlFor={`sensible-${codPrm}`} className="text-sm font-normal">
                      {etiqueta}
                    </Label>
                    <Switch
                      id={`sensible-${codPrm}`}
                      checked={seleccion.has(codPrm)}
                      onCheckedChange={() => alternarSensible(codPrm)}
                    />
                  </div>
                ))}
              </div>
            )}

            {resumenCambios.length > 0 && (
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                <p className="mb-1 font-medium">Esto va a cambiar:</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {resumenCambios.map((frase) => (
                    <li key={frase}>{frase}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={guardar} disabled={cargando || guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
