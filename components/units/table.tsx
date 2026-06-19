"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getColumns } from "./columns";
import { useMemo } from "react";
import type { UnitDetail } from "@/lib/types/core/unit-detail";

const groupByDestination = (data: UnitDetail[]) => {
  return data.reduce(
    (acc, item) => {
      acc[item.destination] = acc[item.destination] || [];
      acc[item.destination].push(item);
      return acc;
    },
    {} as Record<string, UnitDetail[]>,
  );
};

const calculateTotals = (items: UnitDetail[]) => {
  return items.reduce(
    (totals, item) => {
      totals.netWeight += item.netWeight;
      totals.grossWeight += item.grossWeight;
      return totals;
    },
    { netWeight: 0, grossWeight: 0 },
  );
};

export default function TableWithGroupedData({
  unitDetailsData,
}: {
  unitDetailsData: UnitDetail[];
}) {
  const groupedData = useMemo(
    () => groupByDestination(unitDetailsData),
    [unitDetailsData],
  );
  const overallTotals = useMemo(
    () => calculateTotals(unitDetailsData),
    [unitDetailsData],
  );

  return (
    <div className="py-2 space-y-4">
      <CardTitle className="py-2">Unit Details</CardTitle>

      <div className="space-y-4">
        {Object.entries(groupedData).map(([destination, items]) => {
          const totals = calculateTotals(items);
          const table = useReactTable({
            data: items,
            columns: getColumns(items),
            getCoreRowModel: getCoreRowModel(),
          });

          return (
            <div key={destination} className="border p-2 rounded-md">
              <div className="bg-muted px-2 py-1 border-1">
                <CardTitle className="text-sm font-medium">
                  {destination}
                </CardTitle>
              </div>
              <CardContent className="p-2">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="text-xs">
                        {headerGroup.headers.map((header, index) => (
                          <TableHead
                            key={header.id}
                            className={`p-1 ${
                              index === 0
                                ? "w-32"
                                : index === 1
                                ? "w-48"
                                : "w-64"
                            }`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="text-xs">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="p-1">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={getColumns(items).length}
                          className="text-center text-xs py-4"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="font-semibold bg-muted/50 text-xs">
                      <TableCell colSpan={getColumns(items).length - 2}>
                        Total {destination}
                      </TableCell>
                      <TableCell>{totals.netWeight.toFixed(2)} kg</TableCell>
                      <TableCell>{totals.grossWeight.toFixed(2)} kg</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </div>
          );
        })}
        <Card>
          <CardContent className="flex flex-col justify-end !py-3 text-sm">
            <span className="font-black text-right">
              Total net weight: {overallTotals.netWeight.toFixed(2)} kg
            </span>
            <span className="font-black text-right">
              Total gross weight: {overallTotals.grossWeight.toFixed(2)} kg
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
