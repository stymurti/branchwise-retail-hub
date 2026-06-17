import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EmployeeRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  nik: string | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  status: string;
};

export function useEmployees() {
  return useQuery({
    queryKey: ["employees-db"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("full_name");
      if (error) throw error;
      return data as EmployeeRow[];
    },
  });
}

export function useUpsertEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<EmployeeRow> & { full_name: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase.from("employees").update(rest).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("employees").insert(input).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees-db"] }),
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan karyawan"),
  });
}

export function useBranchEmployees(branchId?: string) {
  return useQuery({
    queryKey: ["branch-employees", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_employees")
        .select("*, employees(*)")
        .eq("branch_id", branchId!);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useAssignEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { branch_id: string; employee_id: string; role_in_branch?: string }) => {
      const { error } = await supabase.from("branch_employees").insert(input);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["branch-employees", v.branch_id] });
      qc.invalidateQueries({ queryKey: ["my-branches"] });
      toast.success("Karyawan ditugaskan ke cabang");
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menugaskan"),
  });
}

export function useUnassignEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branch_employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-employees"] });
      qc.invalidateQueries({ queryKey: ["my-branches"] });
    },
  });
}
