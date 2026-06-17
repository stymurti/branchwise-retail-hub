import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "staff" | "cashier";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
}

export interface BranchLite {
  id: string;
  name: string;
  code: string | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  availableBranches: BranchLite[];
  activeBranch: BranchLite | null;
  setActiveBranch: (b: BranchLite | null) => void;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

const USERNAME_DOMAIN = "retailpro.local";
const toEmail = (u: string) =>
  u.includes("@") ? u : `${u.trim().toLowerCase().replace(/\s+/g, "")}@${USERNAME_DOMAIN}`;

const ACTIVE_BRANCH_KEY = "retailpro-active-branch";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [availableBranches, setAvailable] = useState<BranchLite[]>([]);
  const [activeBranch, setActiveBranchState] = useState<BranchLite | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveBranch = useCallback((b: BranchLite | null) => {
    setActiveBranchState(b);
    if (b) localStorage.setItem(ACTIVE_BRANCH_KEY, JSON.stringify(b));
    else localStorage.removeItem(ACTIVE_BRANCH_KEY);
  }, []);

  const loadMeta = useCallback(async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, username, full_name").eq("id", uid).maybeSingle(),
      supabase.rpc("get_current_role"),
    ]);
    setProfile((p as Profile) ?? null);
    const _role = (r as AppRole) ?? null;
    setRole(_role);

    // Branches: if user is super_admin/admin → all branches; else look up via employees -> branch_employees
    let branches: BranchLite[] = [];
    if (_role === "super_admin" || _role === "admin") {
      const { data } = await supabase.from("branches").select("id, name, code").eq("status", "active").order("name");
      branches = (data as BranchLite[]) ?? [];
    } else {
      const { data: emp } = await supabase.from("employees").select("id").eq("user_id", uid).maybeSingle();
      if (emp?.id) {
        const { data: be } = await supabase
          .from("branch_employees")
          .select("branches(id, name, code)")
          .eq("employee_id", emp.id);
        branches = ((be ?? []).map((row: any) => row.branches).filter(Boolean)) as BranchLite[];
      }
    }
    setAvailable(branches);

    // Restore activeBranch from localStorage if still valid; otherwise auto-pick if only 1
    const stored = localStorage.getItem(ACTIVE_BRANCH_KEY);
    let chosen: BranchLite | null = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BranchLite;
        if (branches.some((b) => b.id === parsed.id)) chosen = parsed;
      } catch {}
    }
    if (!chosen && branches.length === 1) chosen = branches[0];
    setActiveBranchState(chosen);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadMeta(s.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
        setAvailable([]);
        setActiveBranchState(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadMeta(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadMeta]);

  const signIn = async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setActiveBranch(null);
  };

  return (
    <Ctx.Provider value={{
      user, session, profile, role, loading,
      availableBranches, activeBranch, setActiveBranch,
      signIn, signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  cashier: "Kasir",
};
