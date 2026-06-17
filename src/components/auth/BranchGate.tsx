import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Wrap POS routes to ensure the cashier has chosen an active branch.
 * - 0 branches → message + back to mode select
 * - 1 branch  → auto-selected (handled by AuthProvider)
 * - >1 branch → picker dialog
 */
export function BranchGate({ children }: { children: React.ReactNode }) {
  const { availableBranches, activeBranch, setActiveBranch, loading } = useAuth();
  const nav = useNavigate();

  if (loading) return null;

  if (availableBranches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-warning mx-auto" />
          <h2 className="text-xl font-bold">Belum Ditugaskan ke Cabang</h2>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung ke cabang manapun. Hubungi Super Admin untuk menugaskan Anda ke cabang melalui menu Manajemen Cabang.
          </p>
          <Button onClick={() => nav("/mode-select")}>Kembali</Button>
        </div>
      </div>
    );
  }

  if (!activeBranch) {
    return (
      <Dialog open>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Pilih Cabang</DialogTitle>
            <DialogDescription>
              Anda terdaftar di beberapa cabang. Pilih cabang yang akan digunakan untuk sesi POS ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {availableBranches.map((b) => (
              <Button key={b.id} variant="outline" className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => setActiveBranch(b)}>
                <Building2 className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium">{b.name}</div>
                  {b.code && <div className="text-xs text-muted-foreground">{b.code}</div>}
                </div>
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => nav("/mode-select")}>Batal</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}
