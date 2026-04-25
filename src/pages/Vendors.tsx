import { useMemo, useState } from "react";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  CheckCircle2,
  TrendingUp,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { VendorFormModal, type Vendor } from "@/components/vendors/VendorFormModal";
import { VendorDetailModal } from "@/components/vendors/VendorDetailModal";

const initialVendors: Vendor[] = [
  {
    id: "VND-001",
    code: "V0001",
    name: "PT Sumber Makmur Sejahtera",
    category: "Makanan & Minuman",
    contactPerson: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@sumbermakmur.co.id",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    paymentTerms: "NET 30",
    bankAccount: "BCA - 1234567890 a/n PT Sumber Makmur",
    taxId: "01.234.567.8-901.000",
    status: "active",
    rating: 5,
    totalPO: 48,
    totalSpent: 285000000,
    notes: "Vendor utama untuk produk makanan kering. Pengiriman tepat waktu.",
  },
  {
    id: "VND-002",
    code: "V0002",
    name: "CV Berkah Elektronik",
    category: "Elektronik",
    contactPerson: "Sari Wijaya",
    phone: "0813-9876-5432",
    email: "sari@berkahelektronik.com",
    address: "Jl. Mangga Dua No. 45, Jakarta Utara",
    paymentTerms: "NET 14",
    bankAccount: "Mandiri - 9876543210 a/n CV Berkah Elektronik",
    taxId: "02.345.678.9-012.000",
    status: "active",
    rating: 4,
    totalPO: 22,
    totalSpent: 156000000,
    notes: "",
  },
  {
    id: "VND-003",
    code: "V0003",
    name: "UD Maju Jaya Tekstil",
    category: "Pakaian & Tekstil",
    contactPerson: "Ahmad Hidayat",
    phone: "0821-1111-2222",
    email: "ahmad@majujaya.id",
    address: "Jl. Tanah Abang Blok A2, Jakarta",
    paymentTerms: "COD",
    bankAccount: "BNI - 5555444433 a/n UD Maju Jaya",
    taxId: "",
    status: "active",
    rating: 4,
    totalPO: 15,
    totalSpent: 89500000,
    notes: "",
  },
  {
    id: "VND-004",
    code: "V0004",
    name: "PT Logistik Cepat Indonesia",
    category: "Logistik",
    contactPerson: "Rina Marlina",
    phone: "0822-3333-4444",
    email: "rina@logcepat.co.id",
    address: "Jl. Gatot Subroto Km. 5, Tangerang",
    paymentTerms: "NET 30",
    bankAccount: "BRI - 7777888899 a/n PT Logistik Cepat",
    taxId: "03.456.789.0-123.000",
    status: "active",
    rating: 5,
    totalPO: 36,
    totalSpent: 67500000,
    notes: "Partner pengiriman antar cabang.",
  },
  {
    id: "VND-005",
    code: "V0005",
    name: "Toko ATK Pintar",
    category: "Alat Tulis Kantor",
    contactPerson: "Hendro",
    phone: "0815-7777-8888",
    email: "",
    address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    paymentTerms: "NET 7",
    bankAccount: "",
    taxId: "",
    status: "inactive",
    rating: 3,
    totalPO: 8,
    totalSpent: 12500000,
    notes: "Kontrak diakhiri Q1 2025.",
  },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(vendors.map((v) => v.category))),
    [vendors]
  );

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(q) ||
      v.code.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.phone.includes(q);
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    totalSpent: vendors.reduce((s, v) => s + v.totalSpent, 0),
    avgRating:
      vendors.length > 0
        ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1)
        : "0",
  };

  const handleSave = (vendor: Vendor) => {
    setVendors((prev) => {
      const exists = prev.some((v) => v.id === vendor.id);
      if (exists) {
        return prev.map((v) => (v.id === vendor.id ? vendor : v));
      }
      return [vendor, ...prev];
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setVendors((prev) => prev.filter((v) => v.id !== deleteId));
    toast.success("Vendor berhasil dihapus");
    setDeleteId(null);
  };

  return (
    <BackOfficeLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Vendor Management</h1>
            <p className="text-sm text-muted-foreground">
              Kelola data supplier dan vendor untuk pengadaan barang
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              setEditingVendor(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Vendor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Vendor</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vendor Aktif</p>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Pembelian</p>
                <p className="text-lg font-bold mt-1 text-primary">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rating Rata-rata</p>
                <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                  {stats.avgRating}
                  <Star className="w-5 h-5 fill-warning text-warning" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, kode, contact person, atau telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Vendor</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Termin</TableHead>
                <TableHead className="text-center">Total PO</TableHead>
                <TableHead className="text-right">Total Pembelian</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
                    Tidak ada vendor ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{v.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.email || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {v.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{v.contactPerson}</p>
                        <p className="text-xs text-muted-foreground">{v.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{v.paymentTerms}</TableCell>
                    <TableCell className="text-center font-medium">{v.totalPO}</TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(v.totalSpent)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= v.rating
                                ? "fill-warning text-warning"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.status === "active" ? "default" : "secondary"}>
                        {v.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => {
                            setViewingVendor(v);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => {
                            setEditingVendor(v);
                            setFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          className="text-destructive"
                          onClick={() => setDeleteId(v.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <VendorFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        vendor={editingVendor}
        onSave={handleSave}
      />
      <VendorDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        vendor={viewingVendor}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              Vendor akan dihapus secara permanen. Riwayat PO yang terkait tetap tersimpan.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BackOfficeLayout>
  );
}
