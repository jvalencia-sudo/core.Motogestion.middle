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
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { type Table as TanstackTable } from "@tanstack/react-table";

import { Card, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  extraActions?: React.ReactNode;
  onlyTable?: boolean;
};

/**
 * Fuzzy filter function.
 *
 * This filter function ranks items based on their match score to the given filter value.
 * It stores the itemRank info as metadata and returns true if the item should be filtered in and false if it should be filtered out.
 *
 * @param {Object} row A row from the data array.
 * @param {string} columnId The id of the column to filter on.
 * @param {string} value The value to filter on.
 * @param {Function} addMeta A function to add metadata to the row.
 * @returns {boolean} True if the item should be filtered in, false if it should be filtered out.
 */
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
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
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
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
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
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
 * Renders a data table with features such as sorting, filtering, pagination, and column visibility toggle.
 *
 * @template TData The type of data items to be displayed in the table.
 * @template TValue The type of values to be used for column definitions.
 *
 * @param {ColumnDef<TData, TValue>[]} props.columns An array of column definitions.
 * @param {TData[]} props.data An array of data items to be displayed in the table.
 * @param {React.ReactNode} [props.extraActions] Optional additional actions to be displayed in the table's header.
 * @param {boolean} [props.onlyTable] If set to true, the table will be rendered without the card component.
 *
 * @returns {JSX.Element} A JSX element rendering the data table.
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
  const [globalFilter, setGlobalFilter] = useState<any>([]);
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

  return onlyTable ? (
    <>
      {renderTable(table, columns)}
      {renderPagination(table)}
    </>
  ) : (
    <Card className="w-full">
      <CardContent>
        <div className="flex items-center justify-between gap-4 py-4">
          <Input
            placeholder="Filter..."
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className="max-w-sm"
          />
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
