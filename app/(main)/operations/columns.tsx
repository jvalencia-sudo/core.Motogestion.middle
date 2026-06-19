"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VwOperationModel } from "@/lib/types/operation/operation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<VwOperationModel>[] = [
  {
    accessorKey: "operationTypeName",
    header: "Type",
  },
  {
    accessorKey: "locationOriginName",
    header: "Location Origin",
  },
  {
    accessorKey: "serviceTypeName",
    header: "Service Type",
  },
  {
    accessorKey: "operationDetails",
    header: "Details",
    cell: ({ row }) => {
      const details = row.original.operationDetails;

      if (!details || details.length === 0) return "No details";

      return (
        <div className="flex flex-col gap-1">
          {details.map((detail, index) => (
            <div key={index} className="whitespace-nowrap">
              {detail.unitType}: <strong>{detail.unitCount}</strong>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
  },
  {
    accessorKey: "loadDate",
    header: "Load Date",
    cell: ({ row }) => {
      const date = new Date(row.original.loadDate);

      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
  {
    accessorKey: "validityDate",
    header: "Validity Date",
    cell: ({ row }) => {
      const date = new Date(row.original.loadDate);

      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour12: false,
      });
    },
  },
  {
    accessorKey: "incoterms",
    header: "Incoterms",
    cell: ({ row }) =>
      row.original.incoterms.length > 0
        ? row.original.incoterms.join(", ")
        : "Local",
  },

  {
    accessorKey: "operationStatusName",
    header: "Status",
  },

  {
    accessorKey: "observation",
    header: "Observation",
    cell: ({ row }) => {
      const observation = row.original.observation || "";
      const maxLength = 20;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate max-w-[150px] block cursor-pointer">
              {observation.length > maxLength
                ? `${observation.slice(0, maxLength)}...`
                : observation}
            </TooltipTrigger>
            {observation.length > maxLength && (
              <TooltipContent>{observation}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];
