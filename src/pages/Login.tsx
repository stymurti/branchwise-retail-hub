import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

        <p className="text-center text-xs text-muted-foreground mt-6">
          User pertama yang mendaftar otomatis menjadi Super Admin.
        </p>
      </div>
    </div>
  );
}
