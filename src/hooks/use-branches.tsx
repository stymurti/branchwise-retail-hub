import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Branch = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  manager: string | null;
  opening_hours: string | null;
  status: string;
};

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useUpsertBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Branch> & { name: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase.from("branches").update(rest).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("branches").insert(input).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Cabang tersimpan");
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan cabang"),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Cabang dihapus");
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menghapus"),
  });
}
