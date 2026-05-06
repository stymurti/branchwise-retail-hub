import { useState } from "react";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtIDR, printDocument } from "@/lib/print";
import { Printer, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Item { id: string; party: string; invoice: string; date: string; due: string; amount: number; paid: number; }

const initialAP: Item[] = [
  { id: "AP-001", party: "PT Indofood Sukses", invoice: "INV-2026/04/123", date: "2026-04-15", due: "2026-05-15", amount: 25000000, paid: 0 },
  { id: "AP-002", party: "CV Aqua Mitra", invoice: "INV-2026/04/445", date: "2026-04-20", due: "2026-05-20", amount: 8500000, paid: 5000000 },
  { id: "AP-003", party: "PT Unilever", invoice: "INV-2026/05/012", date: "2026-05-01", due: "2026-06-01", amount: 14200000, paid: 0 },
];
const initialAR: Item[] = [
  { id: "AR-001", party: "Toko Maju Jaya", invoice: "SI-2026/04/088", date: "2026-04-10", due: "2026-05-10", amount: 12500000, paid: 0 },
  { id: "AR-002", party: "Warung Berkah", invoice: "SI-2026/04/091", date: "2026-04-22", due: "2026-05-22", amount: 4800000, paid: 4800000 },
  { id: "AR-003", party: "Kantin Sekolah Cendekia", invoice: "SI-2026/05/004", date: "2026-05-02", due: "2026-06-02", amount: 7200000, paid: 2000000 },
];

function statusOf(it: Item) {
  if (it.paid >= it.amount) return { label: "Lunas", variant: "default" as const };
  if (it.paid > 0) return { label: "Sebagian", variant: "secondary" as const };
  if (new Date(it.due) < new Date()) return { label: "Jatuh Tempo", variant: "destructive" as const };
  return { label: "Belum Dibayar", variant: "outline" as const };
}

export default function APAR() {
  const [ap, setAp] = useState(initialAP);
  const [ar, setAr] = useState(initialAR);
  const [payOpen, setPayOpen] = useState<{ type: "ap" | "ar"; item: Item } | null>(null);
  const [payAmt, setPayAmt] = useState(0);

  const totalAP = ap.reduce((s, i) => s + (i.amount - i.paid), 0);
  const totalAR = ar.reduce((s, i) => s + (i.amount - i.paid), 0);

  const submitPay = () => {
    if (!payOpen) return;
    const upd = (arr: Item[]) => arr.map(i => i.id === payOpen.item.id ? { ...i, paid: Math.min(i.amount, i.paid + payAmt) } : i);
    if (payOpen.type === "ap") setAp(upd(ap)); else setAr(upd(ar));
    toast.success("Pembayaran dicatat");
    setPayOpen(null); setPayAmt(0);
  };

  const print = (type: "ap" | "ar") => {
    const data = type === "ap" ? ap : ar;
    const title = type === "ap" ? "Laporan Hutang" : "Laporan Piutang";
    const rows = data.map(i => `<tr><td>${i.id}</td><td>${i.party}</td><td>${i.invoice}</td><td>${i.due}</td><td class="right">${fmtIDR(i.amount)}</td><td class="right">${fmtIDR(i.paid)}</td><td class="right">${fmtIDR(i.amount - i.paid)}</td></tr>`).join("");
    printDocument(title, `<div class="header"><div class="brand">RetailPro</div><div>${title}</div></div>
      <table><thead><tr><th>ID</th><th>${type === "ap" ? "Vendor" : "Customer"}</th><th>Invoice</th><th>Jatuh Tempo</th><th>Total</th><th>Dibayar</th><th>Sisa</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  const renderTable = (data: Item[], type: "ap" | "ar") => (
    <Table>
      <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>{type === "ap" ? "Vendor" : "Customer"}</TableHead><TableHead>Invoice</TableHead><TableHead>Jatuh Tempo</TableHead><TableHead>Total</TableHead><TableHead>Sisa</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
      <TableBody>{data.map(i => { const s = statusOf(i); return (
        <TableRow key={i.id}>
          <TableCell className="font-mono">{i.id}</TableCell><TableCell>{i.party}</TableCell><TableCell>{i.invoice}</TableCell><TableCell>{i.due}</TableCell>
          <TableCell>{fmtIDR(i.amount)}</TableCell><TableCell className="font-semibold">{fmtIDR(i.amount - i.paid)}</TableCell>
          <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
          <TableCell>{i.paid < i.amount && <Button size="sm" variant="outline" onClick={() => { setPayOpen({ type, item: i }); setPayAmt(i.amount - i.paid); }}>Bayar</Button>}</TableCell>
        </TableRow>
      );})}</TableBody>
    </Table>
  );

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl lg:text-3xl font-bold">Hutang & Piutang</h1><p className="text-muted-foreground mt-1">Kelola AP/AR perusahaan</p></div>

        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="w-8 h-8 text-destructive" /><div><p className="text-xs text-muted-foreground">Total Hutang (AP)</p><p className="text-2xl font-bold">{fmtIDR(totalAP)}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="w-8 h-8 text-success" /><div><p className="text-xs text-muted-foreground">Total Piutang (AR)</p><p className="text-2xl font-bold">{fmtIDR(totalAR)}</p></div></CardContent></Card>
        </div>

        <Tabs defaultValue="ap">
          <TabsList><TabsTrigger value="ap">Hutang (AP)</TabsTrigger><TabsTrigger value="ar">Piutang (AR)</TabsTrigger></TabsList>
          <TabsContent value="ap">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center"><CardTitle>Daftar Hutang</CardTitle><Button variant="outline" size="sm" onClick={() => print("ap")}><Printer className="w-4 h-4 mr-2" />Cetak</Button></CardHeader>
              <CardContent>{renderTable(ap, "ap")}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ar">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center"><CardTitle>Daftar Piutang</CardTitle><Button variant="outline" size="sm" onClick={() => print("ar")}><Printer className="w-4 h-4 mr-2" />Cetak</Button></CardHeader>
              <CardContent>{renderTable(ar, "ar")}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!payOpen} onOpenChange={v => !v && setPayOpen(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Catat Pembayaran</DialogTitle></DialogHeader>
            {payOpen && (
              <div className="space-y-3">
                <div className="text-sm"><span className="text-muted-foreground">Pihak: </span><b>{payOpen.item.party}</b></div>
                <div className="text-sm"><span className="text-muted-foreground">Sisa: </span><b>{fmtIDR(payOpen.item.amount - payOpen.item.paid)}</b></div>
                <div><Label>Jumlah Bayar</Label><Input type="number" value={payAmt} onChange={e => setPayAmt(Number(e.target.value))} /></div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setPayOpen(null)}>Batal</Button><Button onClick={submitPay}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BackOfficeLayout>
  );
}
