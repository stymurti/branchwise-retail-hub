import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type VendorRow = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  payment_terms: string | null;
  status: string;
};

export function useVendorsDb() {
  return useQuery({
    queryKey: ["vendors-db"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("name");
      if (error) throw error;
      return data as VendorRow[];
    },
  });
}

export function useUpsertVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<VendorRow> & { name: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase.from("vendors").update(rest).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("vendors").insert(input).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors-db"] }),
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan vendor"),
  });
}

// vendor-products relation
export type VendorProductRow = {
  id: string;
  vendor_id: string;
  product_id: string;
  vendor_sku: string | null;
  last_purchase_price: number;
  lead_time_days: number | null;
};

export function useVendorProducts(vendorId?: string) {
  return useQuery({
    queryKey: ["vendor-products", vendorId],
    enabled: !!vendorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_products")
        .select("*, products(*)")
        .eq("vendor_id", vendorId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (VendorProductRow & { products: any })[];
    },
  });
}

export function useLinkVendorProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendor_id: string;
      product_id: string;
      vendor_sku?: string;
      last_purchase_price?: number;
      lead_time_days?: number;
    }) => {
      const { error } = await supabase.from("vendor_products").insert(input);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["vendor-products", v.vendor_id] });
      toast.success("Produk terhubung ke vendor");
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menghubungkan"),
  });
}

export function useUnlinkVendorProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Relasi dihapus");
    },
  });
}
