"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { type Table as TanstackTable } from "@tanstack/react-table";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  extraActions?: React.ReactNode;
  onlyTable?: boolean;
};

/**
 * Fuzzy filter function. Rankea los items por su coincidencia con el valor de búsqueda.
 */
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

function renderTable<TData>(
  table: TanstackTable<TData>,
  columns: ColumnDef<TData>[],
) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              if (header.isPlaceholder) return <TableHead key={header.id} />;
              const contenido = flexRender(
                header.column.columnDef.header,
                header.getContext(),
              );
              const puedeOrdenar = header.column.getCanSort();
              const orden = header.column.getIsSorted();
              return (
                <TableHead key={header.id}>
                  {puedeOrdenar ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="-ml-1 inline-flex select-none items-center gap-1 rounded px-1 py-0.5 hover:text-foreground"
                      title="Ordenar"
                    >
                      {contenido}
                      {orden === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : orden === "desc" ? (
                        <ArrowDown className="size-3.5" />
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    contenido
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-1 px-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function renderPagination(table: TanstackTable<any>) {
  return (
    <div className="flex items-center justify-end space-x-2 mt-4">
      <DataTablePagination table={table} />
    </div>
  );
}

/**
 * Tabla de datos con ordenamiento por columna (clic en el encabezado), filtros,
 * paginación, visibilidad de columnas y botón para limpiar filtros/orden.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  extraActions,
  onlyTable = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable<TData>({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const hayFiltros =
    !!globalFilter || columnFilters.length > 0 || sorting.length > 0;

  const limpiarFiltros = () => {
    table.resetSorting();
    table.resetColumnFilters();
    table.setGlobalFilter("");
  };

  return onlyTable ? (
    <>
      {renderTable(table, columns)}
      {renderPagination(table)}
    </>
  ) : (
    <Card className="w-full">
      <CardContent>
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar..."
              value={globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
              className="max-w-sm"
            />
            {hayFiltros && (
              <Button
                variant="ghost"
                onClick={limpiarFiltros}
                className="h-9 px-2 lg:px-3"
              >
                Limpiar filtros
                <X className="ml-1 size-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            {extraActions}
            <DataTableViewOptions table={table} />
          </div>
        </div>
        <div className="rounded-md border">{renderTable(table, columns)}</div>
        {renderPagination(table)}
      </CardContent>
    </Card>
  );
}
