import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Supabase puts recovery tokens in the URL hash after redirect
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Password dan konfirmasi tidak cocok");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error("Gagal mengubah password: " + error.message);
      return;
    }
    setDone(true);
    toast.success("Password berhasil diubah!");
  };

  if (!valid && !done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <Store className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Tautan Tidak Valid</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Tautan reset password tidak valid atau sudah kadaluarsa. Silakan minta ulang.
          </p>
          <Button variant="outline" onClick={() => navigate("/forgot-password")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Lupa Password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-3">
            <Store className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">RetailPro ERP</h1>
          <p className="text-sm text-muted-foreground">Atur ulang kata sandi Anda</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="w-5 h-5" />
              Reset Password
            </CardTitle>
            <CardDescription>
              {done
                ? "Password Anda telah berhasil diperbarui."
                : "Masukkan password baru untuk akun Anda."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm font-medium">Password berhasil diubah!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Silakan login dengan password baru Anda.
                  </p>
                </div>
                <Button className="w-full" onClick={() => navigate("/login")}>
                  Ke Halaman Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan Password Baru
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
