import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { usePurchaseOrder, useReceivePO } from "@/hooks/use-purchasing";
import { CartonScanner } from "@/components/purchasing/CartonScanner";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

type RowState = {
  id: string;
  product_id: string;
  qty_received: string;
  cost_price: number;
  batch_no: string;
  expired_date: string;
  carton_barcode: string;
};

export default function ReceivePurchaseOrder() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, isLoading } = usePurchaseOrder(id);
  const receive = useReceivePO();
  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    if (data?.items) {
      setRows(
        data.items.map((it) => ({
          id: it.id,
          product_id: it.product_id,
          qty_received: String(it.qty_received || it.qty_ordered),
          cost_price: Number(it.cost_price) || 0,
          batch_no: it.batch_no ?? "",
          expired_date: it.expired_date ?? "",
          carton_barcode: it.carton_barcode ?? "",
        }))
      );
    }
  }, [data]);

  if (isLoading || !data) return <BackOfficeLayout><div className="p-6 text-muted-foreground">Memuat...</div></BackOfficeLayout>;
  const po = data.po;
  const readonly = po.status === "received" || po.status === "cancelled";

  const handleSubmit = async () => {
    if (!id) return;
    await receive.mutateAsync({
      po_id: id,
      branch_id: po.branch_id,
      items: rows.map((r) => ({
        id: r.id,
        product_id: r.product_id,
        qty_received: Number(r.qty_received) || 0,
        cost_price: r.cost_price,
        batch_no: r.batch_no || undefined,
        expired_date: r.expired_date || undefined,
        carton_barcode: r.carton_barcode || undefined,
      })),
    });
    nav("/backoffice/purchasing/po");
  };

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {po.po_number}
              <Badge variant={po.status === "received" ? "default" : "outline"}>{po.status}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Vendor: {(po.vendors as any)?.name} · Cabang: {(po.branches as any)?.name} · Total: {fmt(Number(po.total) || 0)}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right w-24">Order</TableHead>
                <TableHead className="text-right w-28">Diterima</TableHead>
                <TableHead className="w-36">Batch No</TableHead>
                <TableHead className="w-44">Tgl Kadaluarsa</TableHead>
                <TableHead className="w-72">Barcode Karton</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const item = data.items[i];
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{(item.products as any)?.name}</div>
                      <div className="text-xs text-muted-foreground">{(item.products as any)?.sku}</div>
                    </TableCell>
                    <TableCell className="text-right">{Number(item.qty_ordered)}</TableCell>
                    <TableCell>
                      <Input type="number" disabled={readonly} className="text-right" value={r.qty_received}
                        onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, qty_received: e.target.value } : x))} />
                    </TableCell>
                    <TableCell>
                      <Input disabled={readonly} value={r.batch_no}
                        onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, batch_no: e.target.value } : x))} />
                    </TableCell>
                    <TableCell>
                      <Input type="date" disabled={readonly} value={r.expired_date}
                        onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, expired_date: e.target.value } : x))} />
                    </TableCell>
                    <TableCell>
                      {readonly ? (
                        <span className="font-mono text-xs">{r.carton_barcode || "-"}</span>
                      ) : (
                        <CartonScanner value={r.carton_barcode}
                          onChange={(v) => setRows(rows.map((x, j) => j === i ? { ...x, carton_barcode: v } : x))} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {!readonly && (
          <div className="flex justify-end">
            <Button className="gap-2" onClick={handleSubmit} disabled={receive.isPending}>
              <PackageCheck className="w-4 h-4" /> Terima & Update Stok
            </Button>
          </div>
        )}
      </div>
    </BackOfficeLayout>
  );
}
