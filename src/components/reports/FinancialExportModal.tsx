import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const branches = ["Semua Cabang", "Jakarta", "Surabaya", "Bandung", "Medan"];

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((v) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function FinancialExportModal({ open, onOpenChange }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth().toString());
  const [year, setYear] = useState(now.getFullYear().toString());
  const [branch, setBranch] = useState("Semua Cabang");

  const generate = (format: "csv" | "pdf") => {
    const monthName = months[parseInt(month)];
    const filename = `Laporan_Keuangan_${monthName}_${year}_${branch.replace(/\s/g, "_")}.${format === "csv" ? "csv" : "txt"}`;

    const rows: (string | number)[][] = [
      [`Laporan Keuangan Bulanan`],
      [`Periode`, `${monthName} ${year}`],
      [`Cabang`, branch],
      [`Tanggal Ekspor`, new Date().toLocaleString("id-ID")],
      [],
      ["Tanggal", "Penjualan Tunai", "Kartu Debit", "Kartu Kredit", "E-Wallet", "Fee Bank", "Total Bersih"],
      ...Array.from({ length: 30 }, (_, i) => {
        const cash = Math.round(2000000 + Math.random() * 5000000);
        const debit = Math.round(1500000 + Math.random() * 3000000);
        const credit = Math.round(1000000 + Math.random() * 2500000);
        const ewallet = Math.round(500000 + Math.random() * 2000000);
        const fee = Math.round((debit + credit) * 0.015);
        const net = cash + debit + credit + ewallet - fee;
        const date = `${(i + 1).toString().padStart(2, "0")}/${(parseInt(month) + 1).toString().padStart(2, "0")}/${year}`;
        return [date, cash, debit, credit, ewallet, fee, net];
      }),
      [],
      ["TOTAL", "", "", "", "", "", ""],
    ];

    downloadCSV(filename, rows);
    toast.success(`Laporan keuangan ${monthName} ${year} berhasil diunduh`);
    onOpenChange(false);
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Ekspor Laporan Keuangan Bulanan
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Bulan</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cabang</Label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            Laporan akan mencakup: Penjualan tunai, kartu debit/kredit, e-wallet, fee bank, dan total bersih per hari.
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => generate("pdf")}>
            <FileText className="w-4 h-4" />
            Ekspor PDF
          </Button>
          <Button className="flex-1 gap-2" onClick={() => generate("csv")}>
            <Download className="w-4 h-4" />
            Ekspor CSV/Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
