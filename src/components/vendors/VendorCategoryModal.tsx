import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X, Tags } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  usedCategories: string[];
  onSave: (categories: string[]) => void;
}

export function VendorCategoryModal({
  open,
  onOpenChange,
  categories,
  usedCategories,
  onSave,
}: Props) {
  const [list, setList] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  const handleAdd = () => {
    const v = newCat.trim();
    if (!v) return;
    if (list.some((c) => c.toLowerCase() === v.toLowerCase())) {
      toast.error("Kategori sudah ada");
      return;
    }
    setList([...list, v]);
    setNewCat("");
  };

  const handleDelete = (idx: number) => {
    const cat = list[idx];
    if (usedCategories.includes(cat)) {
      toast.error(`Kategori "${cat}" sedang dipakai oleh vendor`);
      return;
    }
    setList(list.filter((_, i) => i !== idx));
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditVal(list[idx]);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const v = editVal.trim();
    if (!v) return;
    if (list.some((c, i) => i !== editIdx && c.toLowerCase() === v.toLowerCase())) {
      toast.error("Kategori sudah ada");
      return;
    }
    setList(list.map((c, i) => (i === editIdx ? v : c)));
    setEditIdx(null);
  };

  const handleSave = () => {
    onSave(list);
    toast.success("Kategori vendor diperbarui");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Pengaturan Kategori Vendor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Tambah kategori baru..."
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} className="gap-1">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </div>

          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {list.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Belum ada kategori
              </p>
            ) : (
              list.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                >
                  {editIdx === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        autoFocus
                      />
                      <Button size="iconSm" variant="ghost" onClick={saveEdit}>
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                      <Button
                        size="iconSm"
                        variant="ghost"
                        onClick={() => setEditIdx(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat}</span>
                        {usedCategories.includes(cat) && (
                          <Badge variant="outline" className="text-xs">
                            dipakai
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="iconSm"
                          variant="ghost"
                          onClick={() => startEdit(idx)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="iconSm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
