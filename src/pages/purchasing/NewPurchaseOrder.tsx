import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useVendorsDb, useVendorProducts } from "@/hooks/use-vendors-db";
import { useBranches } from "@/hooks/use-branches";
import { useCreatePO } from "@/hooks/use-purchasing";
import { toast } from "sonner";

type Row = { product_id: string; name: string; qty: number; price: number };

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function NewPurchaseOrder() {
  const nav = useNavigate();
  const { data: vendors = [] } = useVendorsDb();
  const { data: branches = [] } = useBranches();
  const createPO = useCreatePO();

  const [vendorId, setVendorId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [expected, setExpected] = useState("");
  const [notes, setNotes] = useState("");
  const [taxStr, setTaxStr] = useState("0");
  const [rows, setRows] = useState<Row[]>([]);

  const { data: vps = [] } = useVendorProducts(vendorId);
  const [pickProductId, setPickProductId] = useState("");

  const available = useMemo(
    () => vps.filter((vp) => !rows.some((r) => r.product_id === vp.product_id)),
    [vps, rows]
  );

  const addRow = () => {
    const vp = vps.find((v) => v.product_id === pickProductId);
    if (!vp) return;
    setRows([...rows, { product_id: vp.product_id, name: vp.products?.name, qty: 1, price: Number(vp.last_purchase_price) || 0 }]);
    setPickProductId("");
  };

  const subtotal = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const tax = Number(taxStr) || 0;
  const total = subtotal + tax;

  const submit = async (status: "draft" | "sent") => {
    if (!vendorId || !branchId) return toast.error("Vendor dan cabang wajib diisi");
    if (rows.length === 0) return toast.error("Tambahkan minimal 1 item");
    const id = await createPO.mutateAsync({
      vendor_id: vendorId,
      branch_id: branchId,
      expected_date: expected || undefined,
      notes: notes || undefined,
      status,
      tax,
      items: rows.map((r) => ({ product_id: r.product_id, qty_ordered: r.qty, cost_price: r.price })),
    });
    nav(`/backoffice/purchasing/receive/${id}`);
  };

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Buat Purchase Order</h1>
            <p className="text-sm text-muted-foreground">Pilih vendor → produk vendor otomatis muncul</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 bg-card rounded-xl border p-4">
          <div>
            <Label>Vendor *</Label>
            <Select value={vendorId} onValueChange={(v) => { setVendorId(v); setRows([]); }}>
              <SelectTrigger><SelectValue placeholder="Pilih vendor" /></SelectTrigger>
              <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cabang Tujuan *</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
              <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tanggal Diharapkan</Label>
            <Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </div>
          <div>
            <Label>Catatan</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label>Tambah Produk (dari vendor terpilih)</Label>
              <Select value={pickProductId} onValueChange={setPickProductId} disabled={!vendorId}>
                <SelectTrigger><SelectValue placeholder={vendorId ? "Pilih produk vendor..." : "Pilih vendor dulu"} /></SelectTrigger>
                <SelectContent>
                  {available.map((vp) => (
                    <SelectItem key={vp.product_id} value={vp.product_id}>
                      {vp.products?.name} — {fmt(Number(vp.last_purchase_price) || 0)}
                    </SelectItem>
                  ))}
                  {vendorId && available.length === 0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      Tidak ada produk lain. Tambahkan produk vendor dari menu Vendor.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addRow} disabled={!pickProductId} className="gap-1"><Plus className="w-4 h-4" /> Tambah</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="w-28 text-right">Qty</TableHead>
                <TableHead className="w-40 text-right">Harga</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada item</TableCell></TableRow>}
              {rows.map((r, i) => (
                <TableRow key={r.product_id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>
                    <Input type="number" min={1} className="text-right" value={r.qty}
                      onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) || 0 } : x))} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" className="text-right" value={r.price}
                      onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, price: Number(e.target.value) || 0 } : x))} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{fmt(r.qty * r.price)}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col items-end gap-2 pt-3 border-t">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="w-40 text-right font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Pajak</span>
              <Input className="w-40 text-right" type="number" value={taxStr} onChange={(e) => setTaxStr(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t w-full max-w-xs justify-end">
              <span className="font-semibold">Total</span>
              <span className="w-40 text-right text-lg font-bold text-primary">{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => submit("draft")} disabled={createPO.isPending}>Simpan Draft</Button>
          <Button onClick={() => submit("sent")} disabled={createPO.isPending}>Kirim ke Vendor</Button>
        </div>
      </div>
    </BackOfficeLayout>
  );
}
