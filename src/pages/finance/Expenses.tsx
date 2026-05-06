import { useState } from "react";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Printer, CreditCard, TrendingDown, Check, X } from "lucide-react";
import { fmtIDR, printDocument } from "@/lib/print";
import { toast } from "sonner";

interface Expense { id: string; date: string; category: string; desc: string; branch: string; amount: number; method: string; status: "Approved" | "Pending" | "Rejected"; }

const CATEGORIES = ["Utilitas", "Sewa", "Perlengkapan", "Marketing", "Transportasi", "Maintenance", "Lain-lain"];
const BRANCHES = ["Jakarta", "Surabaya", "Bandung", "Medan"];
const METHODS = ["Kas", "Transfer Bank", "Kartu Kredit"];

const seed: Expense[] = [
  { id: "EXP-001", date: "2026-05-01", category: "Utilitas", desc: "Listrik bulan April", branch: "Jakarta", amount: 4500000, method: "Transfer Bank", status: "Approved" },
  { id: "EXP-002", date: "2026-05-02", category: "Marketing", desc: "Banner promosi cabang", branch: "Surabaya", amount: 1800000, method: "Kas", status: "Approved" },
  { id: "EXP-003", date: "2026-05-03", category: "Maintenance", desc: "Servis AC kantor", branch: "Jakarta", amount: 950000, method: "Kas", status: "Pending" },
  { id: "EXP-004", date: "2026-05-04", category: "Sewa", desc: "Sewa ruko Mei", branch: "Bandung", amount: 12000000, method: "Transfer Bank", status: "Approved" },
  { id: "EXP-005", date: "2026-05-05", category: "Transportasi", desc: "BBM operasional", branch: "Medan", amount: 650000, method: "Kas", status: "Pending" },
];

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>(seed);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: CATEGORIES[0], desc: "", branch: BRANCHES[0], amount: 0, method: METHODS[0] });

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);
  const total = items.filter(i => i.status === "Approved").reduce((s, i) => s + i.amount, 0);
  const pending = items.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0);

  const submit = () => {
    if (!form.desc || form.amount <= 0) return toast.error("Lengkapi data");
    const id = `EXP-${String(items.length + 1).padStart(3, "0")}`;
    setItems([{ id, status: "Pending", ...form }, ...items]);
    setOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), category: CATEGORIES[0], desc: "", branch: BRANCHES[0], amount: 0, method: METHODS[0] });
    toast.success("Pengeluaran ditambahkan");
  };

  const setStatus = (id: string, status: Expense["status"]) => {
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
    toast.success(`Pengeluaran ${status === "Approved" ? "disetujui" : "ditolak"}`);
  };

  const print = () => {
    const rows = filtered.map(i => `<tr><td>${i.date}</td><td>${i.id}</td><td>${i.category}</td><td>${i.desc}</td><td>${i.branch}</td><td>${i.method}</td><td class="right">${fmtIDR(i.amount)}</td><td>${i.status}</td></tr>`).join("");
    printDocument("Laporan Pengeluaran", `<div class="header"><div class="brand">RetailPro</div><div>Laporan Pengeluaran</div></div>
      <table><thead><tr><th>Tanggal</th><th>ID</th><th>Kategori</th><th>Keterangan</th><th>Cabang</th><th>Metode</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>${rows}<tr class="total"><td colspan="6">Total Approved</td><td class="right">${fmtIDR(total)}</td><td></td></tr></tbody></table>`);
  };

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl lg:text-3xl font-bold">Pengeluaran</h1><p className="text-muted-foreground mt-1">Catat & kelola operasional pengeluaran</p></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={print}><Printer className="w-4 h-4 mr-2" />Cetak</Button>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" />Tambah Pengeluaran</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><CreditCard className="w-8 h-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Approved</p><p className="text-2xl font-bold">{fmtIDR(total)}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="w-8 h-8 text-warning" /><div><p className="text-xs text-muted-foreground">Menunggu Approval</p><p className="text-2xl font-bold">{fmtIDR(pending)}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><CreditCard className="w-8 h-8 text-info" /><div><p className="text-xs text-muted-foreground">Jumlah Transaksi</p><p className="text-2xl font-bold">{items.length}</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Daftar Pengeluaran</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>ID</TableHead><TableHead>Kategori</TableHead><TableHead>Keterangan</TableHead><TableHead>Cabang</TableHead><TableHead>Metode</TableHead><TableHead className="text-right">Jumlah</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map(i => (
                <TableRow key={i.id}>
                  <TableCell>{i.date}</TableCell><TableCell className="font-mono">{i.id}</TableCell><TableCell>{i.category}</TableCell><TableCell>{i.desc}</TableCell><TableCell>{i.branch}</TableCell><TableCell>{i.method}</TableCell>
                  <TableCell className="text-right font-semibold">{fmtIDR(i.amount)}</TableCell>
                  <TableCell><Badge variant={i.status === "Approved" ? "default" : i.status === "Pending" ? "secondary" : "destructive"}>{i.status}</Badge></TableCell>
                  <TableCell>
                    {i.status === "Pending" && (
                      <div className="flex gap-1">
                        <Button size="iconSm" variant="ghost" onClick={() => setStatus(i.id, "Approved")}><Check className="w-4 h-4 text-success" /></Button>
                        <Button size="iconSm" variant="ghost" onClick={() => setStatus(i.id, "Rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Pengeluaran</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Kategori</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Keterangan</Label><Input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cabang</Label>
                  <Select value={form.branch} onValueChange={v => setForm({ ...form, branch: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Metode</Label>
                  <Select value={form.method} onValueChange={v => setForm({ ...form, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Jumlah</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button onClick={submit}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BackOfficeLayout>
  );
}
