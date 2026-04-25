import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  bankAccount: string;
  taxId: string;
  status: "active" | "inactive";
  rating: number;
  totalPO: number;
  totalSpent: number;
  notes: string;
}

interface VendorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSave: (vendor: Vendor) => void;
}

const emptyVendor: Vendor = {
  id: "",
  code: "",
  name: "",
  category: "Makanan & Minuman",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  paymentTerms: "NET 30",
  bankAccount: "",
  taxId: "",
  status: "active",
  rating: 5,
  totalPO: 0,
  totalSpent: 0,
  notes: "",
};

const categories = [
  "Makanan & Minuman",
  "Elektronik",
  "Pakaian & Tekstil",
  "Alat Tulis Kantor",
  "Bahan Baku",
  "Jasa & Maintenance",
  "Logistik",
  "Lainnya",
];

const paymentTermsList = ["COD", "NET 7", "NET 14", "NET 30", "NET 60", "NET 90"];

export function VendorFormModal({ open, onOpenChange, vendor, onSave }: VendorFormModalProps) {
  const [formData, setFormData] = useState<Vendor>(emptyVendor);

  useEffect(() => {
    if (vendor) {
      setFormData(vendor);
    } else {
      setFormData({
        ...emptyVendor,
        id: `VND-${Date.now()}`,
        code: `V${String(Math.floor(Math.random() * 9000) + 1000)}`,
      });
    }
  }, [vendor, open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Nama vendor wajib diisi");
      return;
    }
    if (!formData.contactPerson.trim()) {
      toast.error("Contact person wajib diisi");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Nomor telepon wajib diisi");
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Format email tidak valid");
      return;
    }
    onSave(formData);
    toast.success(vendor ? "Vendor berhasil diperbarui" : "Vendor berhasil ditambahkan");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Tambah Vendor Baru"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kode Vendor</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="V0001"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={formData.status === "active"}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, status: c ? "active" : "inactive" })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {formData.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nama Vendor *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="PT Sumber Makmur"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Termin Pembayaran</Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(v) => setFormData({ ...formData, paymentTerms: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsList.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Person *</Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Budi Santoso"
              />
            </div>
            <div className="space-y-2">
              <Label>Telepon *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812-3456-7890"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>NPWP</Label>
              <Input
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="00.000.000.0-000.000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Sudirman No. 123, Jakarta"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Rekening Bank</Label>
            <Input
              value={formData.bankAccount}
              onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              placeholder="BCA - 1234567890 a/n PT Sumber Makmur"
            />
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan tentang vendor..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>{vendor ? "Simpan Perubahan" : "Tambah Vendor"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
