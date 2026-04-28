// FIFO & Expiry utilities for inventory management
// Each product has batches per location. FIFO consumes the oldest (or nearest-expiry) first.

export interface StockBatch {
  id: string;
  quantity: number;
  expiredDate: string; // ISO date YYYY-MM-DD
  receivedDate: string; // ISO date YYYY-MM-DD
  location: string; // branch id, e.g. "pusat", "jakarta"
  batchNumber?: string;
}

/**
 * Sort batches by FIFO rule:
 * 1. Nearest expiry date first (FEFO - First Expired First Out)
 * 2. If same expiry, oldest received date first (true FIFO)
 */
export function sortBatchesFIFO(batches: StockBatch[]): StockBatch[] {
  return [...batches].sort((a, b) => {
    const expA = new Date(a.expiredDate).getTime();
    const expB = new Date(b.expiredDate).getTime();
    if (expA !== expB) return expA - expB;
    return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
  });
}

/**
 * Consume `qty` units from batches at a given location using FIFO.
 * Returns updated batches and a list of consumed batch deductions.
 */
export function consumeFIFO(
  batches: StockBatch[],
  location: string,
  qty: number
): { batches: StockBatch[]; consumed: Array<{ batchId: string; quantity: number; expiredDate: string }> } {
  const locBatches = sortBatchesFIFO(batches.filter((b) => b.location === location && b.quantity > 0));
  const otherBatches = batches.filter((b) => b.location !== location || b.quantity <= 0);
  const consumed: Array<{ batchId: string; quantity: number; expiredDate: string }> = [];
  let remaining = qty;

  const updated = locBatches.map((b) => {
    if (remaining <= 0) return b;
    const take = Math.min(b.quantity, remaining);
    remaining -= take;
    consumed.push({ batchId: b.id, quantity: take, expiredDate: b.expiredDate });
    return { ...b, quantity: b.quantity - take };
  });

  return {
    batches: [...otherBatches, ...updated].filter((b) => b.quantity > 0),
    consumed,
  };
}

/** Total stock for a product at a location */
export function getLocationStock(batches: StockBatch[], location: string): number {
  return batches.filter((b) => b.location === location).reduce((sum, b) => sum + b.quantity, 0);
}

/** Get the nearest expiry batch at a location (FIFO head) */
export function getNextExpiringBatch(batches: StockBatch[], location?: string): StockBatch | null {
  const filtered = location ? batches.filter((b) => b.location === location && b.quantity > 0) : batches.filter((b) => b.quantity > 0);
  const sorted = sortBatchesFIFO(filtered);
  return sorted[0] ?? null;
}

/** Days until a date (negative = expired) */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/** Status label for an expiry date */
export function getExpiryStatus(dateStr: string): {
  label: string;
  variant: "destructive" | "warning" | "success";
  days: number;
} {
  const days = daysUntil(dateStr);
  if (days < 0) return { label: `Kadaluarsa ${Math.abs(days)} hari lalu`, variant: "destructive", days };
  if (days <= 7) return { label: `Exp ${days} hari lagi`, variant: "destructive", days };
  if (days <= 30) return { label: `Exp ${days} hari lagi`, variant: "warning", days };
  return { label: `Exp ${days} hari`, variant: "success", days };
}

/** Generate a unique batch ID */
export function generateBatchId(sku: string): string {
  return `BATCH-${sku}-${Date.now().toString(36).toUpperCase()}`;
}
