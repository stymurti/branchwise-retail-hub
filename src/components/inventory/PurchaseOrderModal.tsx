import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Package, Plus, Trash2, AlertTriangle, ShoppingCart, Printer } from "lucide-react";
import { printDocument } from "@/lib/print";
import { useVendors } from "@/lib/vendorStore";

interface Product {
  id: number;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  cost: number;
  supplier: string;
  branches: Record<string, number>;
}

interface POItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
}

interface PurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  autoFillEmptyStock?: boolean;
  onSubmit: (po: {
    poNumber: string;
    supplier: string;
    destination: string;
    items: POItem[];
    notes: string;
    expectedDate: string;
    totalAmount: number;
  }) => void;
}

const locations = [
  { id: "pusat", name: "Gudang Pusat" },
  { id: "jakarta", name: "Cabang Jakarta" },
  { id: "surabaya", name: "Cabang Surabaya" },
  { id: "bandung", name: "Cabang Bandung" },
  { id: "medan", name: "Cabang Medan" },
];

export function PurchaseOrderModal({ open, onOpenChange, products, onSubmit, autoFillEmptyStock }: PurchaseOrderModalProps) {
  const [destination, setDestination] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [poItems, setPOItems] = useState<POItem[]>([]);
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");

  const { vendors: vendorList, activeVendorNames } = useVendors();

  // Get low stock products (includes empty stock = 0)
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Use active vendors from vendor store
  const suppliers = activeVendorNames;

  // Auto-fill empty/low stock products grouped per vendor when opened via PO route
  useEffect(() => {
    if (open && autoFillEmptyStock && poItems.length === 0 && lowStockProducts.length > 0) {
      const items: POItem[] = lowStockProducts
        .sort((a, b) => {
          // Empty stock first, then by supplier
          if (a.stock === 0 && b.stock !== 0) return -1;
          if (b.stock === 0 && a.stock !== 0) return 1;
          return (a.supplier || "").localeCompare(b.supplier || "");
        })
        .map((product) => {
          const needed = Math.max(product.minStock - product.stock, product.minStock);
          return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: needed,
            unitCost: product.cost,
            totalCost: needed * product.cost,
            supplier: product.supplier,
          };
        });
      setPOItems(items);
      const emptyCount = lowStockProducts.filter(p => p.stock === 0).length;
      const vendorCount = new Set(items.map(i => i.supplier)).size;
      toast.success(`${items.length} produk diisi otomatis`, {
        description: `${emptyCount} stok kosong • ${vendorCount} vendor`,
      });
    }
  }, [open, autoFillEmptyStock]);

  const generatePONumber = () => {
    const date = new Date();
    return `PO-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error("Pilih produk dan masukkan jumlah");
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const qty = parseInt(quantity);
    const existingIndex = poItems.findIndex(item => item.productId === product.id);
    
    if (existingIndex >= 0) {
      const updated = [...poItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].totalCost = updated[existingIndex].quantity * product.cost;
      setPOItems(updated);
    } else {
      setPOItems([...poItems, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        unitCost: product.cost,
        totalCost: qty * product.cost,
        supplier: product.supplier,
      }]);
    }

    setSelectedProduct("");
    setQuantity("");
  };

  const handleRemoveItem = (productId: number) => {
    setPOItems(poItems.filter(item => item.productId !== productId));
  };

  const handleAutoFillLowStock = () => {
    if (!destination) {
      toast.error("Pilih lokasi tujuan terlebih dahulu");
      return;
    }

    const itemsToAdd: POItem[] = [];
    lowStockProducts.forEach(product => {
      const locationStock = product.branches[destination] || 0;
      const needed = product.minStock - locationStock;
      if (needed > 0) {
        const existing = poItems.find(item => item.productId === product.id);
        if (!existing) {
          itemsToAdd.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: Math.max(needed, product.minStock), // Order at least minStock amount
            unitCost: product.cost,
            totalCost: Math.max(needed, product.minStock) * product.cost,
            supplier: product.supplier,
          });
        }
      }
    });

    if (itemsToAdd.length > 0) {
      setPOItems([...poItems, ...itemsToAdd]);
      toast.success(`${itemsToAdd.length} produk stok rendah ditambahkan`);
    } else {
      toast.info("Tidak ada produk stok rendah yang perlu ditambahkan");
    }
  };

  const buildPrintHtml = (poNumber: string, totalAmount: number) => {
    const destName = locations.find((l) => l.id === destination)?.name || destination;
    const date = new Date().toLocaleString("id-ID");
    return `
      <div class="header">
        <div>
          <div class="brand">RetailPro ERP</div>
          <div>Purchase Order</div>
        </div>
        <div style="text-align:right; font-size:12px;">
          <div><b>No PO:</b> ${poNumber}</div>
          <div><b>Tanggal:</b> ${date}</div>
          ${expectedDate ? `<div><b>Diharapkan:</b> ${expectedDate}</div>` : ""}
        </div>
      </div>
      <div class="meta">
        <div><b>Lokasi Tujuan</b> ${destName}</div>
        <div><b>Supplier</b> ${selectedSupplier !== "all" ? selectedSupplier : "Multiple Suppliers"}</div>
      </div>
      <table>
        <thead>
          <tr><th>No</th><th>SKU</th><th>Produk</th><th>Supplier</th><th class="center">Qty</th><th class="right">Harga</th><th class="right">Total</th></tr>
        </thead>
        <tbody>
          ${poItems.map((it, i) => `<tr>
            <td>${i + 1}</td>
            <td>${it.sku}</td>
            <td>${it.productName}</td>
            <td>${it.supplier}</td>
            <td class="center">${it.quantity}</td>
            <td class="right">Rp ${it.unitCost.toLocaleString("id-ID")}</td>
            <td class="right">Rp ${it.totalCost.toLocaleString("id-ID")}</td>
          </tr>`).join("")}
          <tr><td colspan="6" class="right total">Total Amount</td><td class="right total">Rp ${totalAmount.toLocaleString("id-ID")}</td></tr>
        </tbody>
      </table>
      ${notes ? `<p style="margin-top:12px;font-size:12px;"><b>Catatan:</b> ${notes}</p>` : ""}
      <div class="signs">
        <div><div class="sign-line">Dibuat Oleh</div></div>
        <div><div class="sign-line">Disetujui</div></div>
        <div><div class="sign-line">Supplier</div></div>
      </div>
    `;
  };

  const handlePrintOnly = () => {
    if (!destination || poItems.length === 0) {
      toast.error("Lengkapi tujuan dan item PO terlebih dahulu");
      return;
    }
    const totalAmount = poItems.reduce((sum, item) => sum + item.totalCost, 0);
    printDocument("Purchase Order", buildPrintHtml(generatePONumber(), totalAmount));
  };

  const handleSubmit = () => {
    if (!destination) {
      toast.error("Pilih lokasi tujuan");
      return;
    }

    if (poItems.length === 0) {
      toast.error("Tambahkan minimal 1 produk");
      return;
    }

    const totalAmount = poItems.reduce((sum, item) => sum + item.totalCost, 0);
    const poNumber = generatePONumber();

    onSubmit({
      poNumber,
      supplier: selectedSupplier !== "all" ? selectedSupplier : "Multiple Suppliers",
      destination,
      items: poItems,
      notes,
      expectedDate,
      totalAmount,
    });

    // Auto print
    printDocument("Purchase Order", buildPrintHtml(poNumber, totalAmount));

    toast.success("Purchase Order berhasil dibuat");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setDestination("");
    setSelectedProduct("");
    setQuantity("");
    setPOItems([]);
    setNotes("");
    setExpectedDate("");
    setSelectedSupplier("");
  };

  const totalAmount = poItems.reduce((sum, item) => sum + item.totalCost, 0);

  const filteredProducts = selectedSupplier !== "all"
    ? products.filter(p => p.supplier === selectedSupplier)
    : products;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Buat Purchase Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="text-sm">
                  <strong>{lowStockProducts.length}</strong> produk stok rendah
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleAutoFillLowStock}>
                Tambahkan Semua
              </Button>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Lokasi Tujuan *</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Semua supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Supplier</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tanggal Diharapkan</Label>
              <Input
                type="date"
                className="mt-1"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Add Product */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-sm font-medium">Tambah Produk</Label>
            <div className="flex gap-2 mt-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      <div className="flex items-center gap-2">
                        {product.stock <= product.minStock && (
                          <AlertTriangle className="w-3 h-3 text-warning" />
                        )}
                        <span>{product.name}</span>
                        <span className="text-muted-foreground">({product.sku})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Jumlah"
                className="w-24"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PO Items */}
          {poItems.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.supplier}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        Rp {item.unitCost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {item.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.productId)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Total Amount:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      Rp {totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Catatan</Label>
            <Textarea
              placeholder="Catatan untuk PO ini..."
              className="mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrintOnly}>
            <Printer className="w-4 h-4" />
            Print PO
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Buat & Cetak PO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
