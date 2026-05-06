import { useState } from "react";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Printer } from "lucide-react";
import { printDocument, fmtIDR } from "@/lib/print";
import { toast } from "sonner";

interface Entry { id: string; date: string; ref: string; desc: string; debit: string; kredit: string; amount: number; }

const COA = ["Kas", "Bank", "Piutang Usaha", "Persediaan", "Aset Tetap", "Hutang Usaha", "Hutang Bank", "Modal", "Pendapatan", "Beban Gaji", "Beban Utilitas", "Beban Sewa"];

const seed: Entry[] = [
  { id: "JV-001", date: "2026-05-01", ref: "JV-001", desc: "Penjualan Tunai", debit: "Kas", kredit: "Pendapatan", amount: 18150000 },
  { id: "JV-002", date: "2026-05-01", ref: "JV-002", desc: "Pembelian Stok", debit: "Persediaan", kredit: "Hutang Usaha", amount: 5200000 },
  { id: "JV-003", date: "2026-05-02", ref: "JV-003", desc: "Bayar Listrik", debit: "Beban Utilitas", kredit: "Kas", amount: 850000 },
  { id: "JV-004", date: "2026-05-03", ref: "JV-004", desc: "Gaji Karyawan", debit: "Beban Gaji", kredit: "Kas", amount: 24000000 },
];

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), desc: "", debit: "Kas", kredit: "Pendapatan", amount: 0 });

  const total = entries.reduce((s, e) => s + e.amount, 0);

  const submit = () => {
    if (!form.desc || form.amount <= 0) return toast.error("Lengkapi data jurnal");
    const id = `JV-${String(entries.length + 1).padStart(3, "0")}`;
    setEntries([{ id, ref: id, ...form }, ...entries]);
    setOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), desc: "", debit: "Kas", kredit: "Pendapatan", amount: 0 });
    toast.success("Jurnal ditambahkan");
  };

  const print = () => {
    const rows = entries.map(e => `<tr><td>${e.date}</td><td>${e.ref}</td><td>${e.desc}</td><td>${e.debit}</td><td>${e.kredit}</td><td class="right">${fmtIDR(e.amount)}</td></tr>`).join("");
    printDocument("Jurnal Umum", `<div class="header"><div><div class="brand">RetailPro</div><div>Jurnal Umum</div></div><div>Per ${new Date().toLocaleDateString("id-ID")}</div></div>
      <table><thead><tr><th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Jumlah</th></tr></thead><tbody>${rows}<tr class="total"><td colspan="5">Total</td><td class="right">${fmtIDR(total)}</td></tr></tbody></table>`);
  };

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl lg:text-3xl font-bold">Jurnal Umum</h1><p className="text-muted-foreground mt-1">Pencatatan transaksi keuangan</p></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={print}><Printer className="w-4 h-4 mr-2" />Cetak</Button>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" />Tambah Jurnal</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Entri</p><p className="text-2xl font-bold">{entries.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Debit</p><p className="text-2xl font-bold text-success">{fmtIDR(total)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Kredit</p><p className="text-2xl font-bold text-info">{fmtIDR(total)}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Daftar Jurnal</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Ref</TableHead><TableHead>Keterangan</TableHead><TableHead>Debit</TableHead><TableHead>Kredit</TableHead><TableHead className="text-right">Jumlah</TableHead></TableRow></TableHeader>
              <TableBody>{entries.map(e => (
                <TableRow key={e.id}><TableCell>{e.date}</TableCell><TableCell className="font-mono">{e.ref}</TableCell><TableCell>{e.desc}</TableCell><TableCell>{e.debit}</TableCell><TableCell>{e.kredit}</TableCell><TableCell className="text-right font-semibold">{fmtIDR(e.amount)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Jurnal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Keterangan</Label><Input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Debit</Label>
                  <Select value={form.debit} onValueChange={v => setForm({ ...form, debit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COA.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Kredit</Label>
                  <Select value={form.kredit} onValueChange={v => setForm({ ...form, kredit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COA.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
