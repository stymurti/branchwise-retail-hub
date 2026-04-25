import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Mail, Phone, MapPin, CreditCard, FileText, Star } from "lucide-react";
import type { Vendor } from "./VendorFormModal";

interface VendorDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// Mock recent PO data
const mockRecentPOs = [
  { id: "PO-2025-001", date: "2025-04-15", items: 12, total: 4500000, status: "Diterima" },
  { id: "PO-2025-008", date: "2025-04-02", items: 8, total: 2800000, status: "Dibayar" },
  { id: "PO-2025-015", date: "2025-03-20", items: 5, total: 1750000, status: "Dibayar" },
];

export function VendorDetailModal({ open, onOpenChange, vendor }: VendorDetailModalProps) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p>{vendor.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{vendor.code}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Rating */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
              {vendor.status === "active" ? "Aktif" : "Nonaktif"}
            </Badge>
            <Badge variant="outline">{vendor.category}</Badge>
            <Badge variant="outline">Termin: {vendor.paymentTerms}</Badge>
            <div className="flex items-center gap-1 ml-auto">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= vendor.rating ? "fill-warning text-warning" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Total PO</p>
              <p className="text-2xl font-bold mt-1">{vendor.totalPO}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Total Pembelian</p>
              <p className="text-lg font-bold mt-1 text-primary">
                {formatCurrency(vendor.totalSpent)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Rata-rata per PO</p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(vendor.totalPO > 0 ? vendor.totalSpent / vendor.totalPO : 0)}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Informasi Kontak</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Contact Person</p>
                  <p className="font-medium">{vendor.contactPerson || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Telepon</p>
                  <p className="font-medium">{vendor.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{vendor.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">NPWP</p>
                  <p className="font-medium">{vendor.taxId || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Alamat</p>
                  <p className="font-medium">{vendor.address || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Rekening Bank</p>
                  <p className="font-medium">{vendor.bankAccount || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent POs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Riwayat Purchase Order Terakhir</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No PO</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-center">Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.id}</TableCell>
                      <TableCell className="text-muted-foreground">{po.date}</TableCell>
                      <TableCell className="text-center">{po.items}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(po.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {vendor.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Catatan</h3>
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border">
                {vendor.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
