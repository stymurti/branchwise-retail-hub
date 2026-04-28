import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockBatch, sortBatchesFIFO, getExpiryStatus, generateBatchId } from "@/lib/fifo";
import { Plus, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";

interface BatchManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productSku: string;
  batches: StockBatch[];
  onAddBatch: (batch: StockBatch) => void;
}

const locations = [
  { id: "pusat", name: "Gudang Pusat" },
  { id: "jakarta", name: "Cabang Jakarta" },
  { id: "surabaya", name: "Cabang Surabaya" },
  { id: "bandung", name: "Cabang Bandung" },
  { id: "medan", name: "Cabang Medan" },
];

export function BatchManagerModal({ open, onOpenChange, productName, productSku, batches, onAddBatch }: BatchManagerModalProps) {
  const [form, setForm] = useState({
    quantity: "",
    expiredDate: "",
    location: "pusat",
    batchNumber: "",
  });

  const sorted = sortBatchesFIFO(batches);

  const handleAdd = () => {
    const qty = parseInt(form.quantity);
    if (!qty || qty <= 0) return toast.error("Jumlah harus lebih dari 0");
    if (!form.expiredDate) return toast.error("Tanggal expired wajib diisi");

    const newBatch: StockBatch = {
      id: generateBatchId(productSku),
      quantity: qty,
      expiredDate: form.expiredDate,
      receivedDate: new Date().toISOString().split("T")[0],
      location: form.location,
      batchNumber: form.batchNumber || undefined,
    };
    onAddBatch(newBatch);
    toast.success("Batch berhasil ditambahkan (FIFO)");
    setForm({ quantity: "", expiredDate: "", location: "pusat", batchNumber: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Manajemen Batch & Expired - {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add new batch */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <Label className="text-base font-semibold mb-3 block">Tambah Batch Baru</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="grid gap-1">
                <Label className="text-xs">Lokasi</Label>
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Jumlah</Label>
                <Input type="number" min={1} placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Tanggal Expired</Label>
                <Input type="date" value={form.expiredDate} onChange={(e) => setForm({ ...form, expiredDate: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">No. Batch (opsional)</Label>
                <Input placeholder="LOT-001" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
              </div>
            </div>
            <Button className="mt-3 gap-2" onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Tambah Batch
            </Button>
          </div>

          {/* FIFO list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Daftar Batch (Urutan FIFO/FEFO)</Label>
              <Badge variant="secondary">{sorted.length} batch aktif</Badge>
            </div>
            {sorted.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Belum ada batch. Tambah batch baru di atas.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Batch / Lokasi</TableHead>
                      <TableHead>Diterima</TableHead>
                      <TableHead>Expired</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((b, i) => {
                      const status = getExpiryStatus(b.expiredDate);
                      const loc = locations.find((l) => l.id === b.location)?.name ?? b.location;
                      return (
                        <TableRow key={b.id} className={i === 0 ? "bg-primary/5" : ""}>
                          <TableCell className="font-bold text-primary">{i + 1}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{b.batchNumber || b.id.slice(-8)}</p>
                            <p className="text-xs text-muted-foreground">{loc}</p>
                          </TableCell>
                          <TableCell className="text-sm">{b.receivedDate}</TableCell>
                          <TableCell className="text-sm">{b.expiredDate}</TableCell>
                          <TableCell className="text-right font-bold">{b.quantity}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                status.variant === "destructive"
                                  ? "bg-destructive/20 text-destructive"
                                  : status.variant === "warning"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-success/20 text-success"
                              }
                            >
                              {status.variant !== "success" && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              ℹ️ Sistem otomatis menjual batch dengan expired terdekat lebih dulu (FEFO/FIFO).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
