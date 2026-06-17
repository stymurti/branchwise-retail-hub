import { useState } from "react";
import { BackOfficeLayout } from "@/components/layout/BackOfficeLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, MapPin, Users, Building2, Phone, Edit, Trash2, UserPlus, X,
} from "lucide-react";
import { useBranches, useUpsertBranch, useDeleteBranch, type Branch } from "@/hooks/use-branches";
import {
  useEmployees,
  useBranchEmployees,
  useAssignEmployee,
  useUnassignEmployee,
} from "@/hooks/use-employees-db";

const emptyForm = { name: "", code: "", address: "", phone: "", manager: "", opening_hours: "" };

export default function Branches() {
  const { data: branches = [], isLoading } = useBranches();
  const upsert = useUpsertBranch();
  const del = useDeleteBranch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [assignFor, setAssignFor] = useState<Branch | null>(null);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      name: b.name, code: b.code ?? "", address: b.address ?? "",
      phone: b.phone ?? "", manager: b.manager ?? "", opening_hours: b.opening_hours ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    await upsert.mutateAsync({
      id: editing?.id,
      name: form.name,
      code: form.code || null,
      address: form.address || null,
      phone: form.phone || null,
      manager: form.manager || null,
      opening_hours: form.opening_hours || null,
    });
    setOpen(false);
  };

  const toggleStatus = (b: Branch) => {
    upsert.mutate({ id: b.id, name: b.name, status: b.status === "active" ? "inactive" : "active" } as any);
  };

  const active = branches.filter((b) => b.status === "active").length;

  return (
    <BackOfficeLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manajemen Cabang</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola semua cabang. Perubahan tersimpan permanen.</p>
          </div>
          <Button className="gap-2" onClick={startNew}>
            <Plus className="w-4 h-4" /> Tambah Cabang
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Total Cabang" value={branches.length} icon={Building2} />
          <Stat label="Cabang Aktif" value={active} icon={MapPin} />
          <Stat label="Nonaktif" value={branches.length - active} icon={X} />
        </div>

        <div className="bg-card rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cabang</TableHead>
                <TableHead className="hidden md:table-cell">Manager</TableHead>
                <TableHead className="hidden lg:table-cell">Alamat</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-40">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>}
              {!isLoading && branches.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada cabang. Tambahkan cabang pertama.</TableCell></TableRow>}
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {b.code || "-"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p>{b.manager || "-"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{b.phone || "-"}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{b.address || "-"}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch checked={b.status === "active"} onCheckedChange={() => toggleStatus(b)} />
                      <Badge variant={b.status === "active" ? "default" : "secondary"}>
                        {b.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setAssignFor(b)} title="Kelola karyawan">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(b)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive"
                      onClick={() => { if (confirm(`Hapus cabang ${b.name}?`)) del.mutate(b.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Edit Cabang" : "Tambah Cabang"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <Field label="Nama Cabang *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kode"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
              <Field label="Telepon"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            </div>
            <Field label="Alamat"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Manager"><Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} /></Field>
              <Field label="Jam Operasional"><Input value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignEmployeesDialog branch={assignFor} onClose={() => setAssignFor(null)} />
    </BackOfficeLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label>{label}</Label>{children}</div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
      <div className="p-2.5 rounded-lg bg-primary/10"><Icon className="w-5 h-5 text-primary" /></div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function AssignEmployeesDialog({ branch, onClose }: { branch: Branch | null; onClose: () => void }) {
  const { data: employees = [] } = useEmployees();
  const { data: assigned = [] } = useBranchEmployees(branch?.id);
  const assign = useAssignEmployee();
  const unassign = useUnassignEmployee();
  const [pickedId, setPickedId] = useState("");

  if (!branch) return null;
  const assignedIds = new Set(assigned.map((a: any) => a.employee_id));
  const available = employees.filter((e) => !assignedIds.has(e.id));

  return (
    <Dialog open={!!branch} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Karyawan {branch.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <select className="flex-1 border rounded-md px-2 bg-background" value={pickedId} onChange={(e) => setPickedId(e.target.value)}>
              <option value="">Pilih karyawan...</option>
              {available.map((e) => <option key={e.id} value={e.id}>{e.full_name} {e.position ? `· ${e.position}` : ""}</option>)}
            </select>
            <Button disabled={!pickedId || assign.isPending} onClick={async () => {
              await assign.mutateAsync({ branch_id: branch.id, employee_id: pickedId });
              setPickedId("");
            }}>Tugaskan</Button>
          </div>
          <div className="border rounded-lg divide-y">
            {assigned.length === 0 && <div className="p-3 text-sm text-muted-foreground text-center">Belum ada karyawan ditugaskan</div>}
            {assigned.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-2.5">
                <div>
                  <p className="font-medium text-sm">{a.employees?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.employees?.position || "-"}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => unassign.mutate(a.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
