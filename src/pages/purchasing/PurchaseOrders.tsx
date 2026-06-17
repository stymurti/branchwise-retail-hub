import { Link } from "react-router-dom";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, PackageCheck, Eye } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/use-purchasing";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const statusVariant = (s: string) =>
  s === "received" ? "default" : s === "sent" ? "secondary" : s === "cancelled" ? "destructive" : "outline";

const statusLabel = (s: string) =>
  ({ draft: "Draft", sent: "Dikirim", received: "Diterima", cancelled: "Dibatalkan" } as any)[s] ?? s;

export default function PurchaseOrders() {
  const { data: pos = [], isLoading } = usePurchaseOrders();

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pembelian (Purchase Order)</h1>
            <p className="text-sm text-muted-foreground">Buat PO ke vendor, lalu terima barang dengan batch + tanggal kadaluarsa.</p>
          </div>
          <Link to="/backoffice/purchasing/po/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Buat PO Baru</Button>
          </Link>
        </div>

        <div className="bg-card rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No PO</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Cabang Tujuan</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>}
              {!isLoading && pos.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada PO</TableCell></TableRow>}
              {pos.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm">{po.po_number}</TableCell>
                  <TableCell className="text-sm">{po.order_date}</TableCell>
                  <TableCell>{po.vendors?.name || "-"}</TableCell>
                  <TableCell>{po.branches?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(Number(po.total) || 0)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant(po.status) as any}>{statusLabel(po.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {po.status !== "received" && po.status !== "cancelled" && (
                      <Link to={`/backoffice/purchasing/receive/${po.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <PackageCheck className="w-3.5 h-3.5" /> Terima
                        </Button>
                      </Link>
                    )}
                    {po.status === "received" && (
                      <Link to={`/backoffice/purchasing/receive/${po.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1"><Eye className="w-3.5 h-3.5" /> Detail</Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </BackOfficeLayout>
  );
}
