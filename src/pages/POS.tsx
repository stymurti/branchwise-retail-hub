import { useState, useEffect, useRef } from "react";
import { POSLayout } from "@/components/layout/POSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ShiftModal } from "@/components/pos/ShiftModal";
import { MemberModal, Member } from "@/components/pos/MemberModal";
import { DiscountModal, DiscountConfig } from "@/components/pos/DiscountModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Barcode, Plus, Minus, Trash2, CreditCard, Banknote, Wallet, QrCode, User, Percent, X, Clock, AlertTriangle, Package, Calendar, Archive, PauseCircle, PlayCircle, Printer, Keyboard, Calculator, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StockBatch, consumeFIFO, getExpiryStatus, getNextExpiringBatch } from "@/lib/fifo";

interface CartItem { id: string; name: string; price: number; quantity: number; sku: string; }

interface TransactionTab {
  id: string;
  label: string;
  cart: CartItem[];
  discount: DiscountConfig;
  member: Member | null;
}

const STORE_LOCATION = "pusat";
function seed(sku: string, qty: number, daysToExpire: number): StockBatch[] {
  if (qty <= 0) return [];
  const exp = new Date();
  exp.setDate(exp.getDate() + daysToExpire);
  const half = Math.floor(qty / 2);
  const today = new Date();
  const older = new Date(); older.setDate(today.getDate() - 30);
  return [
    { id: `B-${sku}-1`, quantity: half, expiredDate: new Date(exp.getTime() - 15 * 86400000).toISOString().split("T")[0], receivedDate: older.toISOString().split("T")[0], location: STORE_LOCATION, batchNumber: "LOT-A" },
    { id: `B-${sku}-2`, quantity: qty - half, expiredDate: exp.toISOString().split("T")[0], receivedDate: today.toISOString().split("T")[0], location: STORE_LOCATION, batchNumber: "LOT-B" },
  ];
}

const initialProducts = [
  { id: "1", name: "Indomie Goreng", price: 3500, sku: "PRD-001", category: "Makanan", stock: 150, minStock: 50, batches: seed("PRD-001", 150, 90) },
  { id: "2", name: "Susu Ultra 1L", price: 18500, sku: "PRD-002", category: "Minuman", stock: 8, minStock: 20, batches: seed("PRD-002", 8, 5) },
  { id: "3", name: "Aqua 600ml", price: 4000, sku: "PRD-003", category: "Minuman", stock: 200, minStock: 50, batches: seed("PRD-003", 200, 365) },
  { id: "4", name: "Roti Tawar Sari Roti", price: 16000, sku: "PRD-004", category: "Makanan", stock: 5, minStock: 15, batches: seed("PRD-004", 5, 3) },
  { id: "5", name: "Sabun Lifebuoy 100g", price: 5500, sku: "PRD-005", category: "Personal Care", stock: 3, minStock: 20, batches: seed("PRD-005", 3, 720) },
  { id: "6", name: "Kopi Kapal Api Sachet", price: 2000, sku: "PRD-006", category: "Minuman", stock: 120, minStock: 30, batches: seed("PRD-006", 120, 200) },
  { id: "7", name: "Teh Botol Sosro 450ml", price: 5000, sku: "PRD-007", category: "Minuman", stock: 95, minStock: 25, batches: seed("PRD-007", 95, 60) },
  { id: "8", name: "Oreo Original 133g", price: 12500, sku: "PRD-008", category: "Snack", stock: 10, minStock: 20, batches: seed("PRD-008", 10, 25) },
];

const initialMembers: Member[] = [
  { id: "MBR-001", name: "Budi Santoso", phone: "081234567890", points: 1250, tier: "Gold" },
  { id: "MBR-002", name: "Siti Aminah", phone: "082345678901", points: 450, tier: "Silver" },
  { id: "MBR-003", name: "Andi Wijaya", phone: "083456789012", points: 120, tier: "Bronze" },
];

const categories = ["Semua", "Makanan", "Minuman", "Snack", "Personal Care"];
const banks = [{ id: "bca", name: "BCA", type: "Debit & Kredit" }, { id: "mandiri", name: "Mandiri", type: "Debit & Kredit" }, { id: "bni", name: "BNI", type: "Debit" }];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

const newTab = (index: number): TransactionTab => ({
  id: `TAB-${Date.now()}-${index}`,
  label: `Transaksi ${index}`,
  cart: [],
  discount: { type: "percent", value: 0 },
  member: null,
});

export default function POS() {
  const [tabs, setTabs] = useState<TransactionTab[]>([newTab(1)]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [shiftMode, setShiftMode] = useState<"open" | "close">("open");
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftData, setShiftData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showLowStock, setShowLowStock] = useState(true);
  const [products, setProducts] = useState(initialProducts);
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const cart = activeTab.cart;
  const discount = activeTab.discount;
  const selectedMember = activeTab.member;

  const updateActiveTab = (patch: Partial<TransactionTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, ...patch } : t)));
  };

  const addNewTab = () => {
    const next = newTab(tabs.length + 1);
    setTabs((prev) => [...prev, next]);
    setActiveTabId(next.id);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) {
      toast.error("Minimal harus ada 1 tab transaksi");
      return;
    }
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[0].id);
  };

  const lowStockProducts = products.filter((p) => p.stock < p.minStock);
  const getProductStock = (productId: string) => products.find((p) => p.id === productId)?.stock ?? 0;

  const addToCart = (product: typeof products[0]) => {
    if (!isShiftActive) { toast.error("Buka shift terlebih dahulu"); return; }
    if (product.stock <= 0) { toast.error("Stok produk habis, tidak dapat dijual"); return; }

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Stok tersedia hanya ${product.stock} unit`);
        return;
      }
      updateActiveTab({ cart: cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) });
    } else {
      updateActiveTab({ cart: [...cart, { ...product, quantity: 1 }] });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const stock = getProductStock(id);
    const updated = cart.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > stock) { toast.error(`Stok tersedia hanya ${stock} unit`); return item; }
        return { ...item, quantity: Math.max(0, newQty) };
      }
      return item;
    }).filter((item) => item.quantity > 0);
    updateActiveTab({ cart: updated });
  };

  const MAX_QTY_PER_ITEM = 999;
  const setQuantity = (id: string, qty: number) => {
    if (!Number.isFinite(qty) || Number.isNaN(qty)) { toast.error("Jumlah tidak valid"); return; }
    const safeQty = Math.floor(qty);
    if (safeQty <= 0) { updateActiveTab({ cart: cart.filter((item) => item.id !== id) }); return; }
    if (safeQty > MAX_QTY_PER_ITEM) {
      toast.error(`Maksimal ${MAX_QTY_PER_ITEM} unit per item`);
      updateActiveTab({ cart: cart.map((item) => item.id === id ? { ...item, quantity: MAX_QTY_PER_ITEM } : item) });
      return;
    }
    const stock = getProductStock(id);
    if (safeQty > stock) {
      toast.error(`Stok tersedia hanya ${stock} unit`);
      updateActiveTab({ cart: cart.map((item) => item.id === id ? { ...item, quantity: stock } : item) });
      return;
    }
    updateActiveTab({ cart: cart.map((item) => item.id === id ? { ...item, quantity: safeQty } : item) });
  };

  const removeFromCart = (id: string) => updateActiveTab({ cart: cart.filter((item) => item.id !== id) });
  const clearCart = () => updateActiveTab({ cart: [], discount: { type: "percent", value: 0 }, member: null });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount.type === "percent"
    ? subtotal * (discount.value / 100)
    : Math.min(discount.value, subtotal);
  const total = Math.max(0, subtotal - discountAmount);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePaymentComplete = (method: string, _details: any) => {
    const fifoLog: string[] = [];
    setProducts((prev) => prev.map((p) => {
      const cartItem = cart.find((c) => c.id === p.id);
      if (!cartItem) return p;
      const { batches: newBatches, consumed } = consumeFIFO(p.batches, STORE_LOCATION, cartItem.quantity);
      consumed.forEach((c) => fifoLog.push(`${p.name}: ${c.quantity}x dari batch exp ${c.expiredDate}`));
      const newStock = newBatches.reduce((s, b) => s + b.quantity, 0);
      return { ...p, batches: newBatches, stock: newStock };
    }));
    if (fifoLog.length > 0) toast.success("Penjualan FIFO diterapkan", { description: fifoLog.slice(0, 3).join(" • ") });

    // Award points: 1 poin per Rp 1000
    if (selectedMember) {
      const earned = Math.floor(total / 1000);
      setMembers((prev) => prev.map((m) => m.id === selectedMember.id ? { ...m, points: m.points + earned } : m));
      toast.success(`${selectedMember.name} mendapat ${earned} poin`);
    }

    const trx = { id: `TRX-${Date.now()}`, time: new Date(), total, method, items: cart, member: selectedMember };
    setTransactions((prev) => [...prev, trx]);
    clearCart();
  };

  const handleShiftAction = (data: any) => {
    if (shiftMode === "open") { setIsShiftActive(true); setShiftData({ openTime: data.openTime, pettyCash: data.pettyCash, transactions: [] }); toast.success(`Shift dibuka dengan petty cash ${formatCurrency(data.pettyCash)}`); }
    else { setIsShiftActive(false); setShiftData(null); setTransactions([]); }
  };

  const openShiftModal = (mode: "open" | "close") => { setShiftMode(mode); setIsShiftOpen(true); };

  return (
    <POSLayout>
      {/* Transaction Tabs */}
      <div className="flex items-center gap-1 mb-3 border-b overflow-x-auto pb-1">
        {tabs.map((t) => {
          const itemCount = t.cart.reduce((s, i) => s + i.quantity, 0);
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 cursor-pointer whitespace-nowrap text-sm transition-colors ${
                activeTabId === t.id ? "border-primary bg-primary/10 text-primary font-semibold" : "border-transparent text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setActiveTabId(t.id)}
            >
              <span>{t.label}</span>
              {itemCount > 0 && <Badge variant="secondary" className="text-xs">{itemCount}</Badge>}
              {tabs.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        <Button variant="ghost" size="sm" onClick={addNewTab} className="gap-1">
          <Plus className="w-4 h-4" /> Tab Baru
        </Button>
      </div>

      <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        {/* Products */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border overflow-hidden min-h-0">
          <div className="p-3 md:p-4 border-b space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari produk..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              <Button variant="outline" size="icon"><Barcode className="w-5 h-5" /></Button>
              {!isShiftActive ? <Button onClick={() => openShiftModal("open")} className="gap-2"><Clock className="w-4 h-4" /><span className="hidden sm:inline">Buka Shift</span></Button> : <Button variant="destructive" onClick={() => openShiftModal("close")} className="gap-2"><Clock className="w-4 h-4" /><span className="hidden sm:inline">Tutup Shift</span></Button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((category) => (<Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)} className="whitespace-nowrap text-xs md:text-sm">{category}</Button>))}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {showLowStock && lowStockProducts.length > 0 && (
              <div className="mb-4 p-3 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">Stok Minimum Alert ({lowStockProducts.length} produk)</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowLowStock(false)} className="h-6 w-6 p-0"><X className="w-4 h-4" /></Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {lowStockProducts.map((item) => (
                    <div key={item.id} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-md bg-warning/10 border border-warning/20">
                      <Package className="w-4 h-4 text-warning" />
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Stok: <span className="text-warning font-bold">{item.stock}</span> / {item.minStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock < product.minStock;
                const isOutOfStock = product.stock <= 0;
                const nextBatch = getNextExpiringBatch(product.batches, STORE_LOCATION);
                const expStatus = nextBatch ? getExpiryStatus(nextBatch.expiredDate) : null;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-3 md:p-4 rounded-xl border transition-all text-left group relative ${
                      isOutOfStock ? 'bg-muted/30 opacity-60 cursor-not-allowed border-destructive/30'
                      : isLowStock ? 'bg-muted/50 hover:bg-primary/10 border-warning/50'
                      : 'bg-muted/50 hover:bg-primary/10 border-transparent hover:border-primary/30'
                    }`}
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl z-10">
                        <Badge variant="destructive" className="text-xs">HABIS</Badge>
                      </div>
                    )}
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-info/20 mb-2 md:mb-3 flex items-center justify-center relative">
                      <span className="text-2xl md:text-3xl">📦</span>
                      {isLowStock && !isOutOfStock && <div className="absolute top-1 right-1"><AlertTriangle className="w-4 h-4 text-warning" /></div>}
                    </div>
                    <h4 className={`font-medium text-xs md:text-sm line-clamp-2 ${!isOutOfStock && 'group-hover:text-primary'}`}>{product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{product.sku}</p>
                    {nextBatch && expStatus && !isOutOfStock && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        expStatus.variant === "destructive" ? "text-destructive" :
                        expStatus.variant === "warning" ? "text-warning" : "text-muted-foreground"
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">{expStatus.days < 0 ? "EXPIRED" : `Exp ${expStatus.days}d (FIFO)`}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary text-xs md:text-sm">{formatCurrency(product.price)}</span>
                      <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "destructive" : "secondary"} className="text-xs">
                        {isOutOfStock ? "0" : product.stock}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border overflow-hidden">
          <div className="p-3 md:p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{activeTab.label}</h2>
                <p className="text-sm text-muted-foreground">{totalItems} item</p>
              </div>
              {cart.length > 0 && <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive"><Trash2 className="w-4 h-4 mr-1" />Hapus</Button>}
            </div>
            {selectedMember && (
              <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-medium text-primary">{selectedMember.name}</p>
                  <p className="text-muted-foreground">{selectedMember.tier} • {selectedMember.points} poin</p>
                </div>
                <Button variant="ghost" size="iconSm" onClick={() => updateActiveTab({ member: null })}><X className="w-3 h-3" /></Button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 min-h-[150px] max-h-[200px] lg:max-h-none">
            {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8"><QrCode className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" /><p className="font-medium">Keranjang kosong</p><p className="text-sm">Scan barcode atau pilih produk</p></div> : cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center text-lg md:text-xl">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs md:text-sm truncate">{item.name}</p>
                  <p className="text-xs md:text-sm text-primary font-semibold">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-muted-foreground">Total: {formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="iconSm" onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                  <Input
                    type="number" min={1} max={999} step={1} inputMode="numeric"
                    value={item.quantity}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") return;
                      const parsed = Number.parseInt(raw, 10);
                      if (Number.isNaN(parsed)) return;
                      setQuantity(item.id, parsed);
                    }}
                    onBlur={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10);
                      if (!Number.isFinite(parsed) || parsed <= 0) setQuantity(item.id, 1);
                    }}
                    className="w-12 md:w-14 text-center font-medium text-sm h-8 px-1"
                  />
                  <Button variant="outline" size="iconSm" onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <Button variant="ghost" size="iconSm" onClick={() => removeFromCart(item.id)} className="text-destructive"><X className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
          <div className="border-t p-3 md:p-4 space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <Button variant={selectedMember ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setIsMemberOpen(true)}>
                <User className="w-4 h-4" />{selectedMember ? "Member" : "Member"}
              </Button>
              <Button variant={discount.value > 0 ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setIsDiscountOpen(true)}>
                <Percent className="w-4 h-4" />
                {discount.value > 0 ? (discount.type === "percent" ? `${discount.value}%` : formatCurrency(discount.value)) : "Diskon"}
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-success"><span>Diskon</span><span>-{formatCurrency(discountAmount)}</span></div>}
              <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2"><Button variant="posSecondary" size="pos" className="flex-col gap-1"><Banknote className="w-5 h-5 md:w-6 md:h-6" /><span className="text-xs">Tunai</span></Button><Button variant="posSecondary" size="pos" className="flex-col gap-1"><CreditCard className="w-5 h-5 md:w-6 md:h-6" /><span className="text-xs">Kartu</span></Button><Button variant="posSecondary" size="pos" className="flex-col gap-1"><Wallet className="w-5 h-5 md:w-6 md:h-6" /><span className="text-xs">E-Wallet</span></Button></div>
            <Button variant="posPayment" size="xl" className="w-full" disabled={cart.length === 0 || !isShiftActive} onClick={() => setIsPaymentOpen(true)}>Bayar {formatCurrency(total)}</Button>
          </div>
        </div>
      </div>

      <PaymentModal open={isPaymentOpen} onOpenChange={setIsPaymentOpen} total={total} onPaymentComplete={handlePaymentComplete} banks={banks} />
      <ShiftModal open={isShiftOpen} onOpenChange={setIsShiftOpen} mode={shiftMode} shiftData={shiftData ? { ...shiftData, transactions } : undefined} onShiftAction={handleShiftAction} />
      <MemberModal
        open={isMemberOpen}
        onOpenChange={setIsMemberOpen}
        members={members}
        selectedMember={selectedMember}
        onSelectMember={(m) => updateActiveTab({ member: m })}
        onAddMember={(m) => setMembers((prev) => [...prev, m])}
      />
      <DiscountModal
        open={isDiscountOpen}
        onOpenChange={setIsDiscountOpen}
        current={discount}
        subtotal={subtotal}
        onApply={(d) => updateActiveTab({ discount: d })}
      />
    </POSLayout>
  );
}
