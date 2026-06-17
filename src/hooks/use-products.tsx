import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Product = {
  id: string;
  sku: string | null;
  barcode: string | null;
  name: string;
  category: string | null;
  unit: string | null;
  cost_price: number;
  sell_price: number;
  min_stock: number | null;
  image_url: string | null;
  status: string;
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useUpsertProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Product> & { name: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase.from("products").update(rest).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("products").insert(input).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan produk"),
  });
}
