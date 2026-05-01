import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export interface DiscountConfig {
  type: "percent" | "nominal";
  value: number;
  reason?: string;
}

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: DiscountConfig;
  subtotal: number;
  onApply: (config: DiscountConfig) => void;
}

const PRESETS = [5, 10, 15, 20, 25, 50];

export function DiscountModal({ open, onOpenChange, current, subtotal, onApply }: DiscountModalProps) {
  const [type, setType] = useState<"percent" | "nominal">(current.type);
  const [value, setValue] = useState<number>(current.value);
  const [reason, setReason] = useState<string>(current.reason ?? "");

  useEffect(() => {
    if (open) {
      setType(current.type);
      setValue(current.value);
      setReason(current.reason ?? "");
    }
  }, [open, current]);

  const handleApply = () => {
    if (value < 0 || !Number.isFinite(value)) {
      toast.error("Nilai diskon tidak valid");
      return;
    }
    if (type === "percent" && value > 100) {
      toast.error("Diskon persen maksimal 100%");
      return;
    }
    if (type === "nominal" && value > subtotal) {
      toast.error("Diskon nominal melebihi subtotal");
      return;
    }
    onApply({ type, value, reason: reason.trim() || undefined });
    toast.success(value > 0 ? "Diskon diterapkan" : "Diskon dihapus");
    onOpenChange(false);
  };

  const handleReset = () => {
    onApply({ type: "percent", value: 0 });
    onOpenChange(false);
  };

  const preview =
    type === "percent" ? subtotal * (value / 100) : Math.min(value, subtotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Diskon</DialogTitle>
          <DialogDescription>Atur diskon untuk transaksi ini</DialogDescription>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "percent" | "nominal")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="percent">Persentase (%)</TabsTrigger>
            <TabsTrigger value="nominal">Nominal (Rp)</TabsTrigger>
          </TabsList>
          <TabsContent value="percent" className="space-y-3 mt-4">
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <Button key={p} variant={value === p ? "default" : "outline"} size="sm" onClick={() => setValue(p)}>
                  {p}%
                </Button>
              ))}
            </div>
            <div>
              <Label>Custom %</Label>
              <Input type="number" min={0} max={100} value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} />
            </div>
          </TabsContent>
          <TabsContent value="nominal" className="space-y-3 mt-4">
            <Label>Nominal Diskon (Rp)</Label>
            <Input type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} />
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Alasan / Catatan (opsional)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Promo akhir bulan" />
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Diskon</span>
            <span>-Rp {preview.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t">
            <span>Total</span>
            <span className="text-primary">Rp {Math.max(0, subtotal - preview).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button onClick={handleApply}>Terapkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
