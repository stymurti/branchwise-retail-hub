import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Store, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const USERNAME_DOMAIN = "retailpro.local";
const toEmail = (u: string) =>
  u.includes("@") ? u : `${u.trim().toLowerCase().replace(/\s+/g, "")}@${USERNAME_DOMAIN}`;

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bootstrap dialog state
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [bsUsername, setBsUsername] = useState("");
  const [bsFullName, setBsFullName] = useState("");
  const [bsPassword, setBsPassword] = useState("");
  const [bsSubmitting, setBsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/mode-select";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password wajib diisi");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(username, password);
    setSubmitting(false);
    if (error) {
      toast.error("Login gagal: username atau password salah");
      return;
    }
    toast.success("Login berhasil");
    navigate(from, { replace: true });
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bsUsername || !bsPassword) {
      toast.error("Username dan password wajib diisi");
      return;
    }
    if (bsPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    setBsSubmitting(true);
    const cleanUsername = bsUsername.trim().toLowerCase().replace(/\s+/g, "");
    const { error } = await supabase.auth.signUp({
      email: toEmail(cleanUsername),
      password: bsPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/mode-select`,
        data: {
          username: cleanUsername,
          full_name: bsFullName || cleanUsername,
          role: "super_admin",
        },
      },
    });
    setBsSubmitting(false);
    if (error) {
      toast.error("Gagal daftar: " + error.message);
      return;
    }
    toast.success("Super Admin berhasil dibuat. Silakan login.");
    setBootstrapOpen(false);
    setUsername(cleanUsername);
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-3">
            <Store className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">RetailPro ERP</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="contoh: superadmin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Masuk
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Belum punya akun? Hubungi Super Admin Anda.
          </p>
        </form>

        <div className="mt-6 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setBootstrapOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Daftar Super Admin Pertama
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Tombol sementara. Hanya berfungsi jika belum ada user terdaftar.
          </p>
        </div>
      </div>

      <Dialog open={bootstrapOpen} onOpenChange={setBootstrapOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daftar Super Admin Pertama</DialogTitle>
            <DialogDescription>
              Akun pertama yang didaftarkan otomatis menjadi Super Admin. Jika sudah ada user,
              pendaftaran ini akan tetap berjalan namun role akan jadi staff.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBootstrap} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bs-username">Username</Label>
              <Input
                id="bs-username"
                value={bsUsername}
                onChange={(e) => setBsUsername(e.target.value)}
                placeholder="superadmin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bs-fullname">Nama Lengkap (opsional)</Label>
              <Input
                id="bs-fullname"
                value={bsFullName}
                onChange={(e) => setBsFullName(e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bs-password">Password (min. 6 karakter)</Label>
              <Input
                id="bs-password"
                type="password"
                value={bsPassword}
                onChange={(e) => setBsPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBootstrapOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={bsSubmitting}>
                {bsSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Daftar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
