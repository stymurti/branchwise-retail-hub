import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type POStatus = "draft" | "sent" | "received" | "cancelled";

export type PurchaseOrder = {
  id: string;
  po_number: string;
  vendor_id: string;
  branch_id: string;
  status: POStatus;
  order_date: string;
  expected_date: string | null;
  received_date: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  vendors?: any;
  branches?: any;
};

export type POItem = {
  id: string;
  po_id: string;
  product_id: string;
  qty_ordered: number;
  qty_received: number;
  cost_price: number;
  batch_no: string | null;
  expired_date: string | null;
  carton_barcode: string | null;
  products?: any;
};

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*, vendors(name), branches(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PurchaseOrder[];
    },
  });
}

export function usePurchaseOrder(id?: string) {
  return useQuery({
    queryKey: ["purchase-order", id],
    enabled: !!id,
    queryFn: async () => {
      const [{ data: po, error: e1 }, { data: items, error: e2 }] = await Promise.all([
        supabase
          .from("purchase_orders")
          .select("*, vendors(*), branches(*)")
          .eq("id", id!)
          .single(),
        supabase
          .from("purchase_order_items")
          .select("*, products(*)")
          .eq("po_id", id!),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { po: po as PurchaseOrder, items: items as POItem[] };
    },
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendor_id: string;
      branch_id: string;
      expected_date?: string;
      notes?: string;
      status?: POStatus;
      items: { product_id: string; qty_ordered: number; cost_price: number }[];
      tax?: number;
    }) => {
      const subtotal = input.items.reduce((s, i) => s + i.qty_ordered * i.cost_price, 0);
      const tax = input.tax ?? 0;
      const total = subtotal + tax;
      const { data: user } = await supabase.auth.getUser();
      const { data: po, error } = await supabase
        .from("purchase_orders")
        .insert({
          vendor_id: input.vendor_id,
          branch_id: input.branch_id,
          expected_date: input.expected_date,
          notes: input.notes,
          status: input.status ?? "draft",
          subtotal,
          tax,
          total,
          created_by: user.user?.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      const itemsInsert = input.items.map((i) => ({
        po_id: po.id,
        product_id: i.product_id,
        qty_ordered: i.qty_ordered,
        cost_price: i.cost_price,
      }));
      const { error: e2 } = await supabase.from("purchase_order_items").insert(itemsInsert);
      if (e2) throw e2;
      return po.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase Order dibuat");
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal membuat PO"),
  });
}

export function useReceivePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      po_id: string;
      branch_id: string;
      items: {
        id: string;
        product_id: string;
        qty_received: number;
        cost_price: number;
        batch_no?: string;
        expired_date?: string;
        carton_barcode?: string;
      }[];
    }) => {
      // Update item rows
      for (const it of input.items) {
        const { error } = await supabase
          .from("purchase_order_items")
          .update({
            qty_received: it.qty_received,
            batch_no: it.batch_no,
            expired_date: it.expired_date,
            carton_barcode: it.carton_barcode,
          })
          .eq("id", it.id);
        if (error) throw error;
      }
      // Insert batches
      const batches = input.items
        .filter((i) => i.qty_received > 0)
        .map((i) => ({
          product_id: i.product_id,
          branch_id: input.branch_id,
          batch_no: i.batch_no,
          expired_date: i.expired_date,
          qty: i.qty_received,
          cost_price: i.cost_price,
          purchase_order_id: input.po_id,
          carton_barcode: i.carton_barcode,
        }));
      if (batches.length) {
        const { error } = await supabase.from("product_batches").insert(batches);
        if (error) throw error;
      }
      // Update PO status
      const { error: e3 } = await supabase
        .from("purchase_orders")
        .update({ status: "received", received_date: new Date().toISOString().slice(0, 10) })
        .eq("id", input.po_id);
      if (e3) throw e3;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["purchase-order"] });
      toast.success("Barang diterima & stok ditambahkan");
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menerima barang"),
  });
}
