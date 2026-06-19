import { ColumnDef } from "@tanstack/react-table";
import { type UnitDetail } from "@/lib/types/core/unit-detail";

export const getColumns = (data: UnitDetail[]): ColumnDef<UnitDetail>[] => {
  const baseColumns: ColumnDef<UnitDetail>[] = [
    {
      accessorKey: "unitTypeName",
      header: "Unit",
      cell: ({ row }) => <span>{row.original.unitTypeName}</span>,
    },
    {
      accessorKey: "unitCount",
      header: "Unit Count",
      cell: ({ row }) => <span>{row.original.unitCount}</span>,
    },
    {
      accessorKey: "unitWeight",
      header: "Unit Weight",
      cell: ({ row }) => <span>{row.original.unitWeight}</span>,
    },
  ];

  {
    baseColumns.push({
      accessorKey: "dimensions",
      header: "Dimensions (HxWxL)",
      cell: ({ row }) => {
        const { height, width, length } = row.original;
        return height && width && length ? (
          <span>
            {height} x {width} x {length} cm
          </span>
        ) : (
          <span>-</span>
        );
      },
    });
  }

  baseColumns.push(
    {
      accessorKey: "netWeight",
      header: "Net Weight",
      cell: ({ row }) => <span>{row.original.netWeight} kg</span>,
    },
    {
      accessorKey: "grossWeight",
      header: "Gross Weight",
      cell: ({ row }) => <span>{row.original.grossWeight} kg</span>,
    },
  );

  return baseColumns;
};
