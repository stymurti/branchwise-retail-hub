import { useState, useEffect } from "react";
import { POSLayout } from "@/components/layout/POSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, CreditCard, Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";

interface BankPayment {
  id: string;
  bankName: string;
  paymentType: "Debit" | "Kredit" | "Debit & Kredit";
  feePercentage: number;
  active: boolean;
}

const STORAGE_KEY = "pos_bank_payments";

const defaults: BankPayment[] = [
  { id: "1", bankName: "BCA", paymentType: "Debit & Kredit", feePercentage: 1.5, active: true },
  { id: "2", bankName: "Mandiri", paymentType: "Debit & Kredit", feePercentage: 1.8, active: true },
  { id: "3", bankName: "BNI", paymentType: "Debit", feePercentage: 1.2, active: true },
  { id: "4", bankName: "BRI", paymentType: "Kredit", feePercentage: 2.0, active: false },
];

export default function POSSettings() {
  const [banks, setBanks] = useState<BankPayment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaults;
    } catch {
      return defaults;
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankPayment | null>(null);
  const [form, setForm] = useState({
    bankName: "",
    paymentType: "Debit & Kredit" as BankPayment["paymentType"],
    feePercentage: "",
    active: true,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
  }, [banks]);

  const openAdd = () => {
    setEditing(null);
    setForm({ bankName: "", paymentType: "Debit & Kredit", feePercentage: "", active: true });
    setDialogOpen(true);
  };

  const openEdit = (b: BankPayment) => {
    setEditing(b);
    setForm({
      bankName: b.bankName,
      paymentType: b.paymentType,
      feePercentage: b.feePercentage.toString(),
      active: b.active,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.bankName.trim()) {
      toast.error("Nama bank wajib diisi");
      return;
    }
    const fee = parseFloat(form.feePercentage);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      toast.error("Fee persentase harus 0-100");
      return;
    }

    if (editing) {
      setBanks((prev) =>
        prev.map((b) =>
          b.id === editing.id
            ? { ...b, bankName: form.bankName, paymentType: form.paymentType, feePercentage: fee, active: form.active }
            : b
        )
      );
      toast.success("Pengaturan bank diperbarui");
    } else {
      setBanks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          bankName: form.bankName,
          paymentType: form.paymentType,
          feePercentage: fee,
          active: form.active,
        },
      ]);
      toast.success("Bank berhasil ditambahkan");
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
    toast.success("Bank dihapus");
  };

  const toggleActive = (id: string) => {
    setBanks((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  };

  const totalActive = banks.filter((b) => b.active).length;
  const avgFee = banks.length
    ? (banks.reduce((s, b) => s + b.feePercentage, 0) / banks.length).toFixed(2)
    : "0";

  return (
    <POSLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pengaturan POS</h1>
            <p className="text-muted-foreground text-sm">Kelola sistem pembayaran kartu untuk transaksi POS</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Bank Terdaftar</p>
            <p className="text-2xl font-bold mt-1">{banks.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Bank Aktif</p>
            <p className="text-2xl font-bold mt-1 text-success">{totalActive}</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Rata-rata Fee</p>
            <p className="text-2xl font-bold mt-1 text-warning">{avgFee}%</p>
          </div>
        </div>

        {/* Bank Settings Card */}
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-info/10">
                <CreditCard className="w-5 h-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Bank & Sistem Pembayaran Kartu</h3>
                <p className="text-sm text-muted-foreground">
                  Atur nama bank, jenis kartu (debit/kredit) & fee persentase
                </p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={openAdd}>
                  <Plus className="w-4 h-4" />
                  Tambah Bank
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Bank" : "Tambah Bank Pembayaran"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nama Bank</Label>
                    <Input
                      placeholder="Contoh: BCA, Mandiri, BNI"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Pembayaran Kartu</Label>
                    <Select
                      value={form.paymentType}
                      onValueChange={(v: BankPayment["paymentType"]) => setForm({ ...form, paymentType: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Debit">Kartu Debit</SelectItem>
                        <SelectItem value="Kredit">Kartu Kredit</SelectItem>
                        <SelectItem value="Debit & Kredit">Debit & Kredit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fee Persentase (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="Contoh: 1.5"
                      value={form.feePercentage}
                      onChange={(e) => setForm({ ...form, feePercentage: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Biaya yang dikenakan per transaksi kartu
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Status Aktif</p>
                      <p className="text-xs text-muted-foreground">Bank dapat digunakan saat checkout</p>
                    </div>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(c) => setForm({ ...form, active: c })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Batal</Button>
                  <Button className="flex-1 gap-2" onClick={save}>
                    <Save className="w-4 h-4" />
                    Simpan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bank</TableHead>
                  <TableHead>Jenis Kartu</TableHead>
                  <TableHead className="text-center">Fee (%)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.bankName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{b.paymentType}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-warning font-medium">
                      {b.feePercentage.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={b.active} onCheckedChange={() => toggleActive(b.id)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="iconSm" onClick={() => openEdit(b)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          className="text-destructive"
                          onClick={() => remove(b.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {banks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Belum ada bank terdaftar. Klik "Tambah Bank" untuk mulai.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 bg-info/5 border border-info/20 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">ℹ️ Catatan</p>
            <p>
              Bank yang aktif akan muncul sebagai opsi pembayaran kartu di POS. Fee persentase akan
              otomatis dihitung dan dipotong dari setiap transaksi kartu untuk laporan keuangan.
            </p>
          </div>
        </div>
      </div>
    </POSLayout>
  );
}
