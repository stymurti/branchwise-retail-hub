import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const USERNAME_DOMAIN = "retailpro.local";
const toEmail = (u: string) =>
  u.includes("@") ? u : `${u.trim().toLowerCase().replace(/\s+/g, "")}@${USERNAME_DOMAIN}`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast.error("Username wajib diisi");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(toEmail(username), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Gagal mengirim email reset: " + error.message);
      return;
    }
    setSent(true);
    toast.success("Email reset password telah dikirim. Periksa inbox Anda.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-3">
            <Store className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">RetailPro ERP</h1>
          <p className="text-sm text-muted-foreground">Reset kata sandi Anda</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="w-5 h-5" />
              Lupa Password
            </CardTitle>
            <CardDescription>
              Masukkan username Anda dan kami akan mengirimkan tautan reset password ke email terkait.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm font-medium">Email reset password telah dikirim!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Periksa inbox Anda dan ikuti tautan untuk mengatur ulang password.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fp-username">Username</Label>
                  <Input
                    id="fp-username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="contoh: superadmin"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Kirim Link Reset
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
