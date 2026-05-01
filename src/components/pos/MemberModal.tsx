import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Star } from "lucide-react";
import { toast } from "sonner";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  tier: "Bronze" | "Silver" | "Gold";
}

interface MemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  selectedMember: Member | null;
  onSelectMember: (member: Member | null) => void;
  onAddMember: (member: Member) => void;
}

export function MemberModal({ open, onOpenChange, members, selectedMember, onSelectMember, onAddMember }: MemberModalProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  );

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Nama dan nomor HP wajib diisi");
      return;
    }
    const newMember: Member = {
      id: `MBR-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      points: 0,
      tier: "Bronze",
    };
    onAddMember(newMember);
    onSelectMember(newMember);
    toast.success(`Member ${newMember.name} ditambahkan`);
    setForm({ name: "", phone: "", email: "" });
    setShowForm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{showForm ? "Tambah Member Baru" : "Pilih Member"}</DialogTitle>
          <DialogDescription>
            {showForm ? "Daftarkan pelanggan baru ke program member" : "Cari atau daftarkan member untuk transaksi ini"}
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cari nama atau no. HP..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <UserPlus className="w-4 h-4" /> Baru
              </Button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {selectedMember && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => { onSelectMember(null); onOpenChange(false); }}>
                  Batal pilih member
                </Button>
              )}
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Tidak ada member ditemukan</p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onSelectMember(m); onOpenChange(false); }}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedMember?.id === m.id ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.phone}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="w-3 h-3" /> {m.tier}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{m.points} poin</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Nama Lengkap *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Budi Santoso" />
            </div>
            <div>
              <Label>No. HP *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08123456789" />
            </div>
            <div>
              <Label>Email (opsional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Kembali</Button>
              <Button onClick={handleSave}>Simpan Member</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
