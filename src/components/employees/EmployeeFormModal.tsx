import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface EmployeeFormData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  branch: string;
  role: string;
  status: "active" | "inactive";
  joinDate: string;
  salary: number;
}

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EmployeeFormData) => void;
  initialData?: EmployeeFormData | null;
  roles: string[];
  departments: string[];
  branches: string[];
}

const positions = [
  "Store Manager",
  "Supervisor",
  "Cashier",
  "Warehouse Staff",
  "Finance Staff",
  "HR Staff",
  "Admin",
];

const empty: EmployeeFormData = {
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  branch: "",
  role: "",
  status: "active",
  joinDate: new Date().toISOString().split("T")[0],
  salary: 0,
};

export function EmployeeFormModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  roles,
  departments,
  branches,
}: EmployeeFormModalProps) {
  const [form, setForm] = useState<EmployeeFormData>(empty);

  useEffect(() => {
    setForm(initialData ?? empty);
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.position || !form.branch || !form.role) {
      toast.error("Mohon lengkapi data wajib (nama, email, posisi, cabang, role)");
      return;
    }
    onSave(form);
    onOpenChange(false);
    toast.success(initialData ? "Karyawan diperbarui" : "Karyawan ditambahkan");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Karyawan" : "Tambah Karyawan Baru"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nama Lengkap *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama karyawan"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@perusahaan.id"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>No. Telepon</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0812-..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Tanggal Bergabung</Label>
              <Input
                type="date"
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Posisi *</Label>
              <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih posisi" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Departemen</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.filter((d) => d !== "Semua").map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Cabang *</Label>
              <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  {branches.filter((b) => b !== "Semua").map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Role / Hak Akses *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Gaji per Bulan (Rp)</Label>
              <Input
                type="number"
                value={form.salary || ""}
                onChange={(e) => setForm({ ...form, salary: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: "active" | "inactive") => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {initialData ? "Simpan Perubahan" : "Tambah Karyawan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
