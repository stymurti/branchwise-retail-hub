import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";
import {
  useVendorProducts,
  useLinkVendorProduct,
  useUnlinkVendorProduct,
} from "@/hooks/use-vendors-db";
import { useProducts, useUpsertProduct } from "@/hooks/use-products";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function VendorProductsTab({ vendorId }: { vendorId: string }) {
  const { data: vps = [], isLoading } = useVendorProducts(vendorId);
  const { data: products = [] } = useProducts();
  const link = useLinkVendorProduct();
  const unlink = useUnlinkVendorProduct();
  const upsertProduct = useUpsertProduct();

  const [linkOpen, setLinkOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  // Link existing
  const [pickedProductId, setPickedProductId] = useState("");
  const [linkPrice, setLinkPrice] = useState("");
  const [linkLead, setLinkLead] = useState("");
  const [linkSku, setLinkSku] = useState("");

  // New product
  const [np, setNp] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    subcategory: "",
    unit: "pcs",
    cost_price: "",
    sell_price: "",
  });

  const [subFilter, setSubFilter] = useState<string>("all");

  const linkedIds = new Set(vps.map((v) => v.product_id));
  const availableProducts = products.filter((p) => !linkedIds.has(p.id));

  const handleLink = async () => {
    if (!pickedProductId) return;
    await link.mutateAsync({
      vendor_id: vendorId,
      product_id: pickedProductId,
      vendor_sku: linkSku || undefined,
      last_purchase_price: Number(linkPrice) || 0,
      lead_time_days: Number(linkLead) || 0,
    });
    setLinkOpen(false);
    setPickedProductId("");
    setLinkPrice("");
    setLinkLead("");
    setLinkSku("");
  };

  const handleCreateNew = async () => {
    if (!np.name) return;
    const id = await upsertProduct.mutateAsync({
      name: np.name,
      sku: np.sku || null,
      barcode: np.barcode || null,
      category: np.category || null,
      subcategory: np.subcategory || null,
      unit: np.unit,
      cost_price: Number(np.cost_price) || 0,
      sell_price: Number(np.sell_price) || 0,
    });
    await link.mutateAsync({
      vendor_id: vendorId,
      product_id: id,
      last_purchase_price: Number(np.cost_price) || 0,
    });
    setNewOpen(false);
    setNp({ name: "", sku: "", barcode: "", category: "", subcategory: "", unit: "pcs", cost_price: "", sell_price: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Package className="w-4 h-4" /> Produk Vendor ({vps.length})
        </h3>
        <div className="flex gap-2">
          <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Produk Existing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hubungkan Produk Existing</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Produk</Label>
                  <Select value={pickedProductId} onValueChange={setPickedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ""}
                        </SelectItem>
                      ))}
                      {availableProducts.length === 0 && (
                        <div className="px-2 py-3 text-xs text-muted-foreground">Tidak ada produk tersedia</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>SKU Vendor</Label>
                    <Input value={linkSku} onChange={(e) => setLinkSku(e.target.value)} />
                  </div>
                  <div>
                    <Label>Lead Time (hari)</Label>
                    <Input type="number" value={linkLead} onChange={(e) => setLinkLead(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Harga Beli Terakhir</Label>
                  <Input type="number" value={linkPrice} onChange={(e) => setLinkPrice(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLinkOpen(false)}>Batal</Button>
                <Button onClick={handleLink} disabled={!pickedProductId || link.isPending}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Produk Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru dari Vendor</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nama Produk *</Label>
                  <Input value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>SKU</Label>
                    <Input value={np.sku} onChange={(e) => setNp({ ...np, sku: e.target.value })} />
                  </div>
                  <div>
                    <Label>Barcode</Label>
                    <Input value={np.barcode} onChange={(e) => setNp({ ...np, barcode: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Kategori</Label>
                    <Input value={np.category} onChange={(e) => setNp({ ...np, category: e.target.value })} />
                  </div>
                  <div>
                    <Label>Sub-Kategori</Label>
                    <Input
                      value={np.subcategory}
                      onChange={(e) => setNp({ ...np, subcategory: e.target.value })}
                      placeholder="cth: Minuman Ringan"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Unit</Label>
                    <Input value={np.unit} onChange={(e) => setNp({ ...np, unit: e.target.value })} />
                  </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Harga Beli</Label>
                    <Input type="number" value={np.cost_price} onChange={(e) => setNp({ ...np, cost_price: e.target.value })} />
                  </div>
                  <div>
                    <Label>Harga Jual</Label>
                    <Input type="number" value={np.sell_price} onChange={(e) => setNp({ ...np, sell_price: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewOpen(false)}>Batal</Button>
                <Button onClick={handleCreateNew} disabled={!np.name || upsertProduct.isPending}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>SKU Vendor</TableHead>
              <TableHead className="text-right">Harga Beli</TableHead>
              <TableHead className="text-center">Lead Time</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Memuat...</TableCell></TableRow>
            )}
            {!isLoading && vps.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Belum ada produk untuk vendor ini</TableCell></TableRow>
            )}
            {vps.map((vp) => (
              <TableRow key={vp.id}>
                <TableCell>
                  <div className="font-medium">{vp.products?.name}</div>
                  <div className="text-xs text-muted-foreground">{vp.products?.sku}</div>
                </TableCell>
                <TableCell className="text-xs font-mono">{vp.vendor_sku || "-"}</TableCell>
                <TableCell className="text-right">{fmt(Number(vp.last_purchase_price) || 0)}</TableCell>
                <TableCell className="text-center">{vp.lead_time_days ?? 0}d</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => unlink.mutate(vp.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
