"use client";

import { VwOrder } from "@/lib/types/orders/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CirclePlusIcon, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";

const columns: ColumnDef<VwOrder>[] = [
  {
    accessorKey: "orderCode",
    header: "Order ID",
  },
  {
    accessorKey: "clientName",
    header: "Customer",
  },
  {
    accessorKey: "orderStateName",
    header: "Status",
    cell: ({ row }) => {
      const state = row.original.orderStateName;

      // Define styles based on the state
      const stateStyles: Record<string, string> = {
        created: "bg-blue-200 text-blue-600 border-blue-300",
        finished: "bg-primary text-white border-primary",
        processing: "bg-yellow-200 text-yellow-800 border-yellow-300",
        default: "bg-gray-200 text-gray-800 border-gray-300",
      };

      const badgeStyle =
        stateStyles[state.toLowerCase()] || stateStyles.default;

      return (
        <Badge variant="outline" className={`${badgeStyle} px-2 py-1`}>
          {state}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button
          size="sm"
          className="hover:bg-primary hover:text-primary-foreground transition-colors"
          asChild
        >
          <Link
            href={`/orders/${row.original.orderCode}`}
            className="flex items-center"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
        </Button>
      );
    },
  },
];

export default function OrdersTab({ orders }: { orders: Array<VwOrder> }) {
  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active Orders</TabsTrigger>
        <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        <TabsTrigger value="all">All Orders</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="border-none p-0">
        <Table
          data={orders.filter((m) => m.orderStateId !== 3)}
          title="Active Orders"
          description="Manage your active orders and their current status"
        />
      </TabsContent>
      <TabsContent value="completed" className="border-none p-0">
        <Table
          data={orders.filter((m) => m.orderStateId === 3)}
          title="Completed Orders"
          description="View and manage your completed orders"
        />
      </TabsContent>
      <TabsContent value="all" className="border-none p-0">
        <Table
          data={orders}
          title="All Orders"
          description="Overview of all your orders"
        />
      </TabsContent>
    </Tabs>
  );
}

function Table({
  data,
  title,
  description,
}: {
  data: Array<VwOrder>;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          onlyTable
          columns={columns}
          data={data || []}
          extraActions={
            <Link href="/clients/create">
              <Button className="h-8">
                <CirclePlusIcon className="mr-2 h-4 w-4" />
                Create
              </Button>
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
}
