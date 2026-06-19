import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appFetch } from "@/lib/fetch";
import { Client } from "@/lib/types/core/client";

async function load() {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  return await appFetch<Client[]>("/api/client");
}

export default async function Page() {
  const data = await load();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Orders</CardTitle>
        <CardDescription>
          Manage your completed orders and their current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Step</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">#ORD-001</TableCell>
              <TableCell>John Smith</TableCell>
              <TableCell>
                <Badge variant="outline">In Progress</Badge>
              </TableCell>
              <TableCell>Quality Check</TableCell>
              <TableCell>2 files</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">#ORD-002</TableCell>
              <TableCell>Sarah Johnson</TableCell>
              <TableCell>
                <Badge variant="outline">Pending Review</Badge>
              </TableCell>
              <TableCell>Document Verification</TableCell>
              <TableCell>1 file</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
