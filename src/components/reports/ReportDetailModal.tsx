import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, FileSpreadsheet } from "lucide-react";
import { printHTML } from "@/lib/print";

export type ReportType = "sales" | "inventory" | "employees" | "finance";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: ReportType | null;
}

const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

// ===== Mock Data =====
const salesData = [
  { date: "2026-05-01", branch: "Jakarta", trx: 142, gross: 18500000, discount: 350000, net: 18150000 },
  { date: "2026-05-02", branch: "Jakarta", trx: 156, gross: 19800000, discount: 420000, net: 19380000 },
  { date: "2026-05-03", branch: "Surabaya", trx: 98, gross: 12400000, discount: 180000, net: 12220000 },
  { date: "2026-05-04", branch: "Bandung", trx: 87, gross: 9800000, discount: 150000, net: 9650000 },
  { date: "2026-05-05", branch: "Medan", trx: 76, gross: 8200000, discount: 120000, net: 8080000 },
];

const inventoryData = [
  { sku: "SKU-001", name: "Indomie Goreng", category: "Makanan", stock: 240, min: 50, value: 720000, status: "Aman" },
  { sku: "SKU-002", name: "Aqua 600ml", category: "Minuman", stock: 12, min: 30, value: 36000, status: "Menipis" },
  { sku: "SKU-003", name: "Sabun Lifebuoy", category: "Personal Care", stock: 0, min: 20, value: 0, status: "Habis" },
  { sku: "SKU-004", name: "Chitato", category: "Snack", stock: 85, min: 25, value: 765000, status: "Aman" },
  { sku: "SKU-005", name: "Teh Pucuk", category: "Minuman", stock: 45, min: 30, value: 180000, status: "Aman" },
];

const employeeData = [
  { id: "EMP-001", name: "Budi Santoso", role: "Kasir", branch: "Jakarta", hadir: 22, izin: 1, alpha: 0, salary: 4500000 },
  { id: "EMP-002", name: "Siti Aminah", role: "Supervisor", branch: "Jakarta", hadir: 23, izin: 0, alpha: 0, salary: 6500000 },
  { id: "EMP-003", name: "Andi Wijaya", role: "Kasir", branch: "Surabaya", hadir: 21, izin: 1, alpha: 1, salary: 4500000 },
  { id: "EMP-004", name: "Dewi Lestari", role: "Manager", branch: "Bandung", hadir: 23, izin: 0, alpha: 0, salary: 8500000 },
];

const journalData = [
  { date: "2026-05-01", ref: "JV-001", desc: "Penjualan Tunai", debit: "Kas", kredit: "Pendapatan", amount: 18150000 },
  { date: "2026-05-01", ref: "JV-002", desc: "Pembelian Stok", debit: "Persediaan", kredit: "Hutang", amount: 5200000 },
  { date: "2026-05-02", ref: "JV-003", desc: "Bayar Listrik", debit: "Beban Utilitas", kredit: "Kas", amount: 850000 },
  { date: "2026-05-03", ref: "JV-004", desc: "Gaji Karyawan", debit: "Beban Gaji", kredit: "Kas", amount: 24000000 },
];

const balanceSheet = {
  aset: [
    { name: "Kas & Setara Kas", value: 145000000 },
    { name: "Piutang Usaha", value: 32000000 },
    { name: "Persediaan", value: 187000000 },
    { name: "Aset Tetap", value: 425000000 },
  ],
  kewajiban: [
    { name: "Hutang Usaha", value: 48000000 },
    { name: "Hutang Bank", value: 120000000 },
    { name: "Hutang Pajak", value: 18000000 },
  ],
  ekuitas: [
    { name: "Modal Disetor", value: 400000000 },
    { name: "Laba Ditahan", value: 203000000 },
  ],
};

const cashflowData = [
  { kategori: "Operasional", item: "Penerimaan Penjualan", value: 471000000 },
  { kategori: "Operasional", item: "Pembayaran Supplier", value: -185000000 },
  { kategori: "Operasional", item: "Gaji & Operasional", value: -98000000 },
  { kategori: "Investasi", item: "Pembelian Peralatan", value: -45000000 },
  { kategori: "Pendanaan", item: "Cicilan Bank", value: -25000000 },
];

const titles: Record<ReportType, string> = {
  sales: "Laporan Penjualan",
  inventory: "Laporan Inventory",
  employees: "Laporan Karyawan",
  finance: "Laporan Keuangan",
};

function exportCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport(title: string, html: string) {
  printHTML(`
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="border-bottom: 2px solid #333; padding-bottom: 10px;">RetailPro - ${title}</h1>
      <p style="color:#666; margin-bottom:20px;">Periode: Mei 2026 | Dicetak: ${new Date().toLocaleString("id-ID")}</p>
      ${html}
    </div>
  `);
}

function tableToHTML(rows: any[], headers: { key: string; label: string; format?: (v: any) => string }[]) {
  return `<table style="width:100%; border-collapse:collapse;">
    <thead><tr>${headers.map((h) => `<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">${h.label}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td style="border:1px solid #ddd;padding:8px;">${h.format ? h.format(r[h.key]) : r[h.key]}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;
}

export function ReportDetailModal({ open, onOpenChange, type }: Props) {
  if (!type) return null;

  const totalSales = salesData.reduce((s, r) => s + r.net, 0);
  const totalAset = balanceSheet.aset.reduce((s, r) => s + r.value, 0);
  const totalKewajiban = balanceSheet.kewajiban.reduce((s, r) => s + r.value, 0);
  const totalEkuitas = balanceSheet.ekuitas.reduce((s, r) => s + r.value, 0);
  const cashOps = cashflowData.filter((r) => r.kategori === "Operasional").reduce((s, r) => s + r.value, 0);
  const cashInv = cashflowData.filter((r) => r.kategori === "Investasi").reduce((s, r) => s + r.value, 0);
  const cashFin = cashflowData.filter((r) => r.kategori === "Pendanaan").reduce((s, r) => s + r.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
          <DialogDescription>Periode: Mei 2026</DialogDescription>
        </DialogHeader>

        {type === "sales" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-primary/10"><p className="text-xs text-muted-foreground">Total Net</p><p className="text-xl font-bold">{fmt(totalSales)}</p></div>
              <div className="p-4 rounded-lg bg-info/10"><p className="text-xs text-muted-foreground">Transaksi</p><p className="text-xl font-bold">{salesData.reduce((s, r) => s + r.trx, 0)}</p></div>
              <div className="p-4 rounded-lg bg-success/10"><p className="text-xs text-muted-foreground">Avg/Trx</p><p className="text-xl font-bold">{fmt(Math.round(totalSales / salesData.reduce((s, r) => s + r.trx, 0)))}</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => exportCSV("laporan-penjualan", salesData)}><FileSpreadsheet className="w-4 h-4 mr-1" />CSV</Button>
              <Button variant="outline" size="sm" onClick={() => printReport("Laporan Penjualan", tableToHTML(salesData, [
                { key: "date", label: "Tanggal" }, { key: "branch", label: "Cabang" }, { key: "trx", label: "Transaksi" },
                { key: "gross", label: "Gross", format: fmt }, { key: "discount", label: "Diskon", format: fmt }, { key: "net", label: "Net", format: fmt }
              ]))}><Printer className="w-4 h-4 mr-1" />Print</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Cabang</TableHead><TableHead>Trx</TableHead><TableHead>Gross</TableHead><TableHead>Diskon</TableHead><TableHead>Net</TableHead></TableRow></TableHeader>
              <TableBody>{salesData.map((r, i) => (
                <TableRow key={i}><TableCell>{r.date}</TableCell><TableCell>{r.branch}</TableCell><TableCell>{r.trx}</TableCell><TableCell>{fmt(r.gross)}</TableCell><TableCell>{fmt(r.discount)}</TableCell><TableCell className="font-semibold">{fmt(r.net)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </div>
        )}

        {type === "inventory" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-primary/10"><p className="text-xs text-muted-foreground">Total SKU</p><p className="text-xl font-bold">{inventoryData.length}</p></div>
              <div className="p-4 rounded-lg bg-warning/10"><p className="text-xs text-muted-foreground">Menipis/Habis</p><p className="text-xl font-bold">{inventoryData.filter((r) => r.status !== "Aman").length}</p></div>
              <div className="p-4 rounded-lg bg-success/10"><p className="text-xs text-muted-foreground">Nilai Stok</p><p className="text-xl font-bold">{fmt(inventoryData.reduce((s, r) => s + r.value, 0))}</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => exportCSV("laporan-inventory", inventoryData)}><FileSpreadsheet className="w-4 h-4 mr-1" />CSV</Button>
              <Button variant="outline" size="sm" onClick={() => printReport("Laporan Inventory", tableToHTML(inventoryData, [
                { key: "sku", label: "SKU" }, { key: "name", label: "Produk" }, { key: "category", label: "Kategori" },
                { key: "stock", label: "Stok" }, { key: "min", label: "Min" }, { key: "value", label: "Nilai", format: fmt }, { key: "status", label: "Status" }
              ]))}><Printer className="w-4 h-4 mr-1" />Print</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Produk</TableHead><TableHead>Kategori</TableHead><TableHead>Stok</TableHead><TableHead>Nilai</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{inventoryData.map((r) => (
                <TableRow key={r.sku}><TableCell>{r.sku}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.category}</TableCell><TableCell>{r.stock}</TableCell><TableCell>{fmt(r.value)}</TableCell><TableCell>
                  <Badge variant={r.status === "Aman" ? "default" : r.status === "Menipis" ? "secondary" : "destructive"}>{r.status}</Badge>
                </TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </div>
        )}

        {type === "employees" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-primary/10"><p className="text-xs text-muted-foreground">Total Karyawan</p><p className="text-xl font-bold">{employeeData.length}</p></div>
              <div className="p-4 rounded-lg bg-success/10"><p className="text-xs text-muted-foreground">Avg Kehadiran</p><p className="text-xl font-bold">{Math.round(employeeData.reduce((s, r) => s + r.hadir, 0) / employeeData.length)}</p></div>
              <div className="p-4 rounded-lg bg-info/10"><p className="text-xs text-muted-foreground">Total Payroll</p><p className="text-xl font-bold">{fmt(employeeData.reduce((s, r) => s + r.salary, 0))}</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => exportCSV("laporan-karyawan", employeeData)}><FileSpreadsheet className="w-4 h-4 mr-1" />CSV</Button>
              <Button variant="outline" size="sm" onClick={() => printReport("Laporan Karyawan", tableToHTML(employeeData, [
                { key: "id", label: "ID" }, { key: "name", label: "Nama" }, { key: "role", label: "Jabatan" }, { key: "branch", label: "Cabang" },
                { key: "hadir", label: "Hadir" }, { key: "izin", label: "Izin" }, { key: "alpha", label: "Alpha" }, { key: "salary", label: "Gaji", format: fmt }
              ]))}><Printer className="w-4 h-4 mr-1" />Print</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nama</TableHead><TableHead>Jabatan</TableHead><TableHead>Cabang</TableHead><TableHead>Hadir</TableHead><TableHead>Izin</TableHead><TableHead>Alpha</TableHead><TableHead>Gaji</TableHead></TableRow></TableHeader>
              <TableBody>{employeeData.map((r) => (
                <TableRow key={r.id}><TableCell>{r.id}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.role}</TableCell><TableCell>{r.branch}</TableCell><TableCell>{r.hadir}</TableCell><TableCell>{r.izin}</TableCell><TableCell>{r.alpha}</TableCell><TableCell>{fmt(r.salary)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </div>
        )}

        {type === "finance" && (
          <Tabs defaultValue="journal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="journal">Jurnal</TabsTrigger>
              <TabsTrigger value="balance">Neraca</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="journal" className="space-y-3 mt-4">
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => exportCSV("jurnal", journalData)}><FileSpreadsheet className="w-4 h-4 mr-1" />CSV</Button>
                <Button variant="outline" size="sm" onClick={() => printReport("Jurnal Umum", tableToHTML(journalData, [
                  { key: "date", label: "Tanggal" }, { key: "ref", label: "Ref" }, { key: "desc", label: "Keterangan" },
                  { key: "debit", label: "Debit" }, { key: "kredit", label: "Kredit" }, { key: "amount", label: "Jumlah", format: fmt }
                ]))}><Printer className="w-4 h-4 mr-1" />Print</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Ref</TableHead><TableHead>Keterangan</TableHead><TableHead>Debit</TableHead><TableHead>Kredit</TableHead><TableHead>Jumlah</TableHead></TableRow></TableHeader>
                <TableBody>{journalData.map((r) => (
                  <TableRow key={r.ref}><TableCell>{r.date}</TableCell><TableCell>{r.ref}</TableCell><TableCell>{r.desc}</TableCell><TableCell>{r.debit}</TableCell><TableCell>{r.kredit}</TableCell><TableCell className="font-semibold">{fmt(r.amount)}</TableCell></TableRow>
                ))}</TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="balance" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-primary">ASET</h3>
                  <Table>
                    <TableBody>
                      {balanceSheet.aset.map((r) => (
                        <TableRow key={r.name}><TableCell>{r.name}</TableCell><TableCell className="text-right">{fmt(r.value)}</TableCell></TableRow>
                      ))}
                      <TableRow className="font-bold border-t-2"><TableCell>Total Aset</TableCell><TableCell className="text-right">{fmt(totalAset)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">KEWAJIBAN</h3>
                    <Table>
                      <TableBody>
                        {balanceSheet.kewajiban.map((r) => (
                          <TableRow key={r.name}><TableCell>{r.name}</TableCell><TableCell className="text-right">{fmt(r.value)}</TableCell></TableRow>
                        ))}
                        <TableRow className="font-semibold"><TableCell>Subtotal</TableCell><TableCell className="text-right">{fmt(totalKewajiban)}</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">EKUITAS</h3>
                    <Table>
                      <TableBody>
                        {balanceSheet.ekuitas.map((r) => (
                          <TableRow key={r.name}><TableCell>{r.name}</TableCell><TableCell className="text-right">{fmt(r.value)}</TableCell></TableRow>
                        ))}
                        <TableRow className="font-bold border-t-2"><TableCell>Total Kewajiban + Ekuitas</TableCell><TableCell className="text-right">{fmt(totalKewajiban + totalEkuitas)}</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cashflow" className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-success/10"><p className="text-xs text-muted-foreground">Operasional</p><p className="text-lg font-bold">{fmt(cashOps)}</p></div>
                <div className="p-4 rounded-lg bg-warning/10"><p className="text-xs text-muted-foreground">Investasi</p><p className="text-lg font-bold">{fmt(cashInv)}</p></div>
                <div className="p-4 rounded-lg bg-info/10"><p className="text-xs text-muted-foreground">Pendanaan</p><p className="text-lg font-bold">{fmt(cashFin)}</p></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => exportCSV("cashflow", cashflowData)}><FileSpreadsheet className="w-4 h-4 mr-1" />CSV</Button>
                <Button variant="outline" size="sm" onClick={() => printReport("Cash Flow", tableToHTML(cashflowData, [
                  { key: "kategori", label: "Kategori" }, { key: "item", label: "Item" }, { key: "value", label: "Nilai", format: fmt }
                ]))}><Printer className="w-4 h-4 mr-1" />Print</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Kategori</TableHead><TableHead>Item</TableHead><TableHead className="text-right">Nilai</TableHead></TableRow></TableHeader>
                <TableBody>
                  {cashflowData.map((r, i) => (
                    <TableRow key={i}><TableCell><Badge variant="outline">{r.kategori}</Badge></TableCell><TableCell>{r.item}</TableCell><TableCell className={`text-right font-semibold ${r.value < 0 ? "text-destructive" : "text-success"}`}>{fmt(r.value)}</TableCell></TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2"><TableCell colSpan={2}>Net Cash Flow</TableCell><TableCell className="text-right">{fmt(cashOps + cashInv + cashFin)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
