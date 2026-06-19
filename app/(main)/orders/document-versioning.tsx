"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { VwDocument } from "@/lib/types/orders/document";
import { DocumentHistory } from "@/lib/types/orders/document-history";
import { Download, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { uploadDocumentVersion } from "./actions";

export default function DocumentVersioning({
  document,
}: {
  document: VwDocument;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<DocumentHistory[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [changeReason, setChangeReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    if (open) {
      (async () => {
        const res = await fetch(`/api/document/${document.documentId}/history`);
        if (res.ok) {
          setVersions(await res.json());
        }
      })();
    }
  }, [open]);

  async function onSubmit() {
    setError(undefined);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("documentId", String(document.documentId));
    formData.append("changeReason", changeReason || "");

    const resp = await uploadDocumentVersion(formData);
    if (resp.error) {
      setError(resp.error);
    } else {
      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully",
      });
      setOpen(false);
      setFile(null);
      setChangeReason(null);
    }
    setLoading(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Badge className="cursor-pointer hover:bg-slate-50" variant="outline">
            Current version
          </Badge>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>File Versions: {document.documentName}</DialogTitle>
            <DialogDescription>
              View previous versions or upload a new version of this file.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Change Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.documentHistoryId}>
                    <TableCell>{version.versionNumber}</TableCell>
                    <TableCell>
                      {new Date(version.changeTimestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>Juan Ciro</TableCell>
                    <TableCell>{version.changeReason}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Separator />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-version" className="text-right">
                Upload New Version
              </Label>
              <Input
                id="new-version"
                type="file"
                className="col-span-3"
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-version" className="text-right">
                  Change reason
                </Label>
                <Textarea
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button disabled={!file || loading} onClick={onSubmit}>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
