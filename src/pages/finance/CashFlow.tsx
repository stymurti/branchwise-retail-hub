import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Printer } from "lucide-react";
import { fmtIDR, printDocument } from "@/lib/print";

const flow = [
  { kategori: "Operasional", item: "Penerimaan Penjualan", value: 471000000 },
  { kategori: "Operasional", item: "Pembayaran Supplier", value: -185000000 },
  { kategori: "Operasional", item: "Gaji & Operasional", value: -98000000 },
  { kategori: "Operasional", item: "Beban Utilitas", value: -12500000 },
  { kategori: "Investasi", item: "Pembelian Peralatan POS", value: -45000000 },
  { kategori: "Investasi", item: "Renovasi Cabang Bandung", value: -28000000 },
  { kategori: "Pendanaan", item: "Cicilan Pinjaman Bank", value: -25000000 },
  { kategori: "Pendanaan", item: "Setoran Modal", value: 50000000 },
];

const monthly = [
  { month: "Jan", masuk: 320000000, keluar: 245000000 },
  { month: "Feb", masuk: 340000000, keluar: 260000000 },
  { month: "Mar", masuk: 380000000, keluar: 280000000 },
  { month: "Apr", masuk: 360000000, keluar: 295000000 },
  { month: "May", masuk: 471000000, keluar: 393500000 },
];

export default function CashFlow() {
  const ops = flow.filter(f => f.kategori === "Operasional").reduce((s, f) => s + f.value, 0);
  const inv = flow.filter(f => f.kategori === "Investasi").reduce((s, f) => s + f.value, 0);
  const fin = flow.filter(f => f.kategori === "Pendanaan").reduce((s, f) => s + f.value, 0);
  const net = ops + inv + fin;

  const print = () => {
    const rows = flow.map(f => `<tr><td>${f.kategori}</td><td>${f.item}</td><td class="right">${fmtIDR(f.value)}</td></tr>`).join("");
    printDocument("Laporan Cash Flow", `<div class="header"><div class="brand">RetailPro</div><div>Laporan Arus Kas</div></div>
      <table><thead><tr><th>Kategori</th><th>Item</th><th>Nilai</th></tr></thead><tbody>${rows}<tr class="total"><td colspan="2">Net Cash Flow</td><td class="right">${fmtIDR(net)}</td></tr></tbody></table>`);
  };

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl lg:text-3xl font-bold">Cash Flow</h1><p className="text-muted-foreground mt-1">Arus kas masuk & keluar</p></div>
          <Button variant="outline" onClick={print}><Printer className="w-4 h-4 mr-2" />Cetak</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><ArrowUpCircle className="w-4 h-4 text-success" />Operasional</div><p className="text-xl font-bold text-success">{fmtIDR(ops)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><ArrowDownCircle className="w-4 h-4 text-warning" />Investasi</div><p className="text-xl font-bold text-warning">{fmtIDR(inv)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><ArrowUpCircle className="w-4 h-4 text-info" />Pendanaan</div><p className="text-xl font-bold text-info">{fmtIDR(fin)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Wallet className="w-4 h-4 text-primary" />Net Cash Flow</div><p className="text-xl font-bold text-primary">{fmtIDR(net)}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Tren 5 Bulan</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}Jt`} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => fmtIDR(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="masuk" name="Masuk" stroke="hsl(var(--success))" strokeWidth={3} />
                  <Line type="monotone" dataKey="keluar" name="Keluar" stroke="hsl(var(--destructive))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Perbandingan Masuk vs Keluar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}Jt`} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => fmtIDR(v)} />
                  <Legend />
                  <Bar dataKey="masuk" name="Masuk" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="keluar" name="Keluar" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Rincian Arus Kas</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Kategori</TableHead><TableHead>Item</TableHead><TableHead className="text-right">Nilai</TableHead></TableRow></TableHeader>
              <TableBody>
                {flow.map((f, i) => (
                  <TableRow key={i}><TableCell><Badge variant="outline">{f.kategori}</Badge></TableCell><TableCell>{f.item}</TableCell><TableCell className={`text-right font-semibold ${f.value < 0 ? "text-destructive" : "text-success"}`}>{fmtIDR(f.value)}</TableCell></TableRow>
                ))}
                <TableRow className="font-bold border-t-2"><TableCell colSpan={2}>Net Cash Flow</TableCell><TableCell className={`text-right ${net < 0 ? "text-destructive" : "text-success"}`}>{fmtIDR(net)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </BackOfficeLayout>
  );
}
