import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cashiers = ["Semua Kasir", "Andi Wijaya", "Budi Santoso", "Citra Dewi", "Dewi Lestari"];

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => {
    const s = String(v ?? "");
    return s.includes(",") ? `"${s}"` : s;
  }).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function CashierDailyReportModal({ open, onOpenChange }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [cashier, setCashier] = useState("Semua Kasir");

  // Mock data
  const data = [
    { name: "Andi Wijaya", shift: "Pagi", trx: 42, cash: 3200000, card: 2100000, ewallet: 1500000, opening: 500000 },
    { name: "Budi Santoso", shift: "Siang", trx: 38, cash: 2800000, card: 1900000, ewallet: 1200000, opening: 500000 },
    { name: "Citra Dewi", shift: "Pagi", trx: 51, cash: 4100000, card: 2500000, ewallet: 1800000, opening: 500000 },
    { name: "Dewi Lestari", shift: "Malam", trx: 29, cash: 1900000, card: 1400000, ewallet: 900000, opening: 500000 },
  ].filter((d) => cashier === "Semua Kasir" || d.name === cashier);

  const totals = data.reduce(
    (acc, d) => ({
      trx: acc.trx + d.trx,
      cash: acc.cash + d.cash,
      card: acc.card + d.card,
      ewallet: acc.ewallet + d.ewallet,
      total: acc.total + d.cash + d.card + d.ewallet,
    }),
    { trx: 0, cash: 0, card: 0, ewallet: 0, total: 0 }
  );

  const exportCSV = () => {
    const rows: (string | number)[][] = [
      [`Laporan Harian Kasir`],
      [`Tanggal`, date],
      [`Filter Kasir`, cashier],
      [],
      ["Kasir", "Shift", "Jumlah Transaksi", "Kas Awal", "Tunai", "Kartu", "E-Wallet", "Total"],
      ...data.map((d) => [d.name, d.shift, d.trx, d.opening, d.cash, d.card, d.ewallet, d.cash + d.card + d.ewallet]),
      [],
      ["TOTAL", "", totals.trx, "", totals.cash, totals.card, totals.ewallet, totals.total],
    ];
    downloadCSV(`Laporan_Harian_Kasir_${date}.csv`, rows);
    toast.success("Laporan harian kasir berhasil diunduh");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-success" />
            Laporan Harian Kasir
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Kasir</Label>
              <Select value={cashier} onValueChange={setCashier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cashiers.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead className="text-center">Trx</TableHead>
                  <TableHead className="text-right">Tunai</TableHead>
                  <TableHead className="text-right">Kartu</TableHead>
                  <TableHead className="text-right">E-Wallet</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d) => (
                  <TableRow key={d.name}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.shift}</TableCell>
                    <TableCell className="text-center">{d.trx}</TableCell>
                    <TableCell className="text-right">{formatRp(d.cash)}</TableCell>
                    <TableCell className="text-right">{formatRp(d.card)}</TableCell>
                    <TableCell className="text-right">{formatRp(d.ewallet)}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatRp(d.cash + d.card + d.ewallet)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell className="text-center">{totals.trx}</TableCell>
                  <TableCell className="text-right">{formatRp(totals.cash)}</TableCell>
                  <TableCell className="text-right">{formatRp(totals.card)}</TableCell>
                  <TableCell className="text-right">{formatRp(totals.ewallet)}</TableCell>
                  <TableCell className="text-right text-primary">{formatRp(totals.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Tutup</Button>
          <Button className="flex-1 gap-2" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            Ekspor CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
