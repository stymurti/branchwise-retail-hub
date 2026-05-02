import { useEffect, useState } from "react";
import { Building2, Users, Package, Pencil, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Branch {
  name: string;
  sales: number;
  target: number;
  employees: number;
  products: number;
  trend: number;
}

const initialBranches: Branch[] = [
  { name: "Cabang Jakarta Pusat", sales: 156000000, target: 180000000, employees: 24, products: 1250, trend: 12.5 },
  { name: "Cabang Surabaya", sales: 98000000, target: 100000000, employees: 18, products: 980, trend: 8.2 },
  { name: "Cabang Bandung", sales: 72000000, target: 80000000, employees: 12, products: 750, trend: -2.4 },
  { name: "Cabang Medan", sales: 45000000, target: 60000000, employees: 10, products: 620, trend: 5.8 },
];

const STORAGE_KEY = "retailpro-branch-targets";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function BranchPerformance() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const targets = JSON.parse(raw) as Record<string, number>;
        setBranches((prev) =>
          prev.map((b) => (targets[b.name] ? { ...b, target: targets[b.name] } : b)),
        );
      }
    } catch {}
  }, []);

  const persist = (updated: Branch[]) => {
    const map: Record<string, number> = {};
    updated.forEach((b) => (map[b.name] = b.target));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {}
  };

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditValue(branches[i].target.toString());
  };

  const saveEdit = (i: number) => {
    const num = parseInt(editValue.replace(/[^0-9]/g, ""), 10);
    if (!num || num <= 0) {
      toast.error("Target harus angka lebih dari 0");
      return;
    }
    const updated = branches.map((b, idx) => (idx === i ? { ...b, target: num } : b));
    setBranches(updated);
    persist(updated);
    setEditingIndex(null);
    toast.success("Target penjualan diperbarui");
  };

  return (
    <div className="bg-card rounded-xl border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Performa Cabang</h3>
          <p className="text-sm text-muted-foreground">Target dapat diedit oleh Back Office</p>
        </div>
        <Building2 className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="space-y-5">
        {branches.map((branch, index) => {
          const progress = (branch.sales / branch.target) * 100;
          const isEditing = editingIndex === index;
          return (
            <div
              key={branch.name}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{branch.name}</h4>
                <span
                  className={`text-sm font-medium ${
                    branch.trend >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {branch.trend >= 0 ? "+" : ""}
                  {branch.trend}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Penjualan</span>
                  <span className="font-medium">{formatCurrency(branch.sales)}</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <div className="flex justify-between items-center text-xs text-muted-foreground gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                      <span>Target Rp</span>
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <Button size="iconSm" variant="ghost" onClick={() => saveEdit(index)}>
                        <Check className="w-3.5 h-3.5 text-success" />
                      </Button>
                      <Button size="iconSm" variant="ghost" onClick={() => setEditingIndex(null)}>
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(index)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <span>Target: {formatCurrency(branch.target)}</span>
                        <Pencil className="w-3 h-3" />
                      </button>
                      <span>{progress.toFixed(0)}%</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{branch.employees}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{branch.products}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
