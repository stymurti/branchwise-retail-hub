import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Shield, UserCog, User, ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole, ROLE_LABELS } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Row {
  user_id: string;
  username: string;
  full_name: string | null;
  role: AppRole;
}

const roleIcon = (r: AppRole) => {
  switch (r) {
    case "super_admin": return <Shield className="w-3.5 h-3.5" />;
    case "admin": return <UserCog className="w-3.5 h-3.5" />;
    case "staff": return <User className="w-3.5 h-3.5" />;
    case "cashier": return <ShoppingCart className="w-3.5 h-3.5" />;
  }
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "", password: "", full_name: "", role: "staff" as AppRole,
  });

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles").select("id, username, full_name");
    const { data: roles } = await supabase
      .from("user_roles").select("user_id, role");
    const merged: Row[] = (profiles ?? []).map((p) => {
      const r = (roles ?? []).find((x) => x.user_id === p.id);
      return {
        user_id: p.id,
        username: p.username,
        full_name: p.full_name,
        role: (r?.role as AppRole) ?? "staff",
      };
    });
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) {
      toast.error("Username & password wajib");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.functions.invoke("admin-create-user", {
      body: form,
    });
    setSubmitting(false);
    if (error) {
      toast.error(`Gagal: ${error.message}`);
      return;
    }
    toast.success(`User ${form.username} berhasil dibuat`);
    setDialogOpen(false);
    setForm({ username: "", password: "", full_name: "", role: "staff" });
    load();
  };

  const handleUpdateRole = async (user_id: string, newRole: AppRole) => {
    const { error: delErr } = await supabase
      .from("user_roles").delete().eq("user_id", user_id);
    if (delErr) { toast.error(delErr.message); return; }
    const { error: insErr } = await supabase
      .from("user_roles").insert({ user_id, role: newRole });
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Role diperbarui");
    load();
  };

  const handleDelete = async (user_id: string, username: string) => {
    if (!confirm(`Hapus user "${username}"?`)) return;
    const { error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id },
    });
    if (error) { toast.error(error.message); return; }
    toast.success("User dihapus");
    load();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/backoffice">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Manajemen User</h1>
              <p className="text-sm text-muted-foreground">
                Hanya Super Admin yang dapat menambah, mengubah role, atau menghapus user
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Tambah User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Buat User Baru</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input
                    placeholder="cth: kasir01"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    placeholder="cth: Budi Santoso"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password * (min 6 karakter)</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="cashier">Kasir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button className="flex-1" onClick={handleCreate} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada user</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.user_id}>
                  <TableCell className="font-medium">{r.username}</TableCell>
                  <TableCell>{r.full_name ?? "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={r.role}
                      onValueChange={(v) => handleUpdateRole(r.user_id, v as AppRole)}
                      disabled={r.user_id === currentUser?.id}
                    >
                      <SelectTrigger className="w-44 h-8">
                        <div className="flex items-center gap-2">
                          {roleIcon(r.role)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="cashier">Kasir</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="iconSm"
                      className="text-destructive"
                      disabled={r.user_id === currentUser?.id}
                      onClick={() => handleDelete(r.user_id, r.username)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-2 text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" /> Hierarki Role
          </p>
          <ul className="space-y-1 ml-6 list-disc">
            <li><strong>Super Admin</strong> — akses penuh termasuk manajemen user</li>
            <li><strong>Admin</strong> — kelola operasional, laporan, dan pengaturan</li>
            <li><strong>Staff</strong> — operasional gudang & inventory</li>
            <li><strong>Kasir</strong> — akses POS dan transaksi penjualan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
