import { useEffect, useState } from "react";
import type { Vendor } from "@/components/vendors/VendorFormModal";

const STORAGE_KEY = "retailpro_vendors_v1";

export const seedVendors: Vendor[] = [
  {
    id: "VND-001",
    code: "V0001",
    name: "PT Indofood",
    category: "Makanan & Minuman",
    contactPerson: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@indofood.co.id",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    paymentTerms: "NET 30",
    bankAccount: "BCA - 1234567890",
    taxId: "01.234.567.8-901.000",
    status: "active",
    rating: 5,
    totalPO: 48,
    totalSpent: 285000000,
    notes: "",
  },
  {
    id: "VND-002",
    code: "V0002",
    name: "PT Ultra Jaya",
    category: "Makanan & Minuman",
    contactPerson: "Sari Wijaya",
    phone: "0813-9876-5432",
    email: "sari@ultrajaya.com",
    address: "Bandung",
    paymentTerms: "NET 14",
    bankAccount: "",
    taxId: "",
    status: "active",
    rating: 4,
    totalPO: 22,
    totalSpent: 156000000,
    notes: "",
  },
  {
    id: "VND-003",
    code: "V0003",
    name: "PT Danone",
    category: "Makanan & Minuman",
    contactPerson: "Ahmad Hidayat",
    phone: "0821-1111-2222",
    email: "",
    address: "Jakarta",
    paymentTerms: "NET 30",
    bankAccount: "",
    taxId: "",
    status: "active",
    rating: 4,
    totalPO: 15,
    totalSpent: 89500000,
    notes: "",
  },
  {
    id: "VND-004",
    code: "V0004",
    name: "PT Nippon Indosari",
    category: "Makanan & Minuman",
    contactPerson: "Rina",
    phone: "0822-3333-4444",
    email: "",
    address: "Cikarang",
    paymentTerms: "NET 30",
    bankAccount: "",
    taxId: "",
    status: "active",
    rating: 5,
    totalPO: 36,
    totalSpent: 67500000,
    notes: "",
  },
  {
    id: "VND-005",
    code: "V0005",
    name: "PT Unilever",
    category: "Makanan & Minuman",
    contactPerson: "Hendro",
    phone: "0815-7777-8888",
    email: "",
    address: "Jakarta",
    paymentTerms: "NET 30",
    bankAccount: "",
    taxId: "",
    status: "active",
    rating: 5,
    totalPO: 40,
    totalSpent: 120000000,
    notes: "",
  },
  {
    id: "VND-006",
    code: "V0006",
    name: "PT Santos Jaya",
    category: "Makanan & Minuman",
    contactPerson: "Dewi",
    phone: "0816-2222-3333",
    email: "",
    address: "Sidoarjo",
    paymentTerms: "NET 14",
    bankAccount: "",
    taxId: "",
    status: "active",
    rating: 4,
    totalPO: 18,
    totalSpent: 45000000,
    notes: "",
  },
];

const CATEGORIES_KEY = "retailpro_vendor_categories_v1";

export const seedCategories = [
  "Makanan & Minuman",
  "Elektronik",
  "Pakaian & Tekstil",
  "Alat Tulis Kantor",
  "Bahan Baku",
  "Jasa & Maintenance",
  "Logistik",
  "Lainnya",
];

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readVendors(): Vendor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedVendors;
}

function writeVendors(v: Vendor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  notify();
}

function readCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedCategories;
}

function writeCategories(c: string[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(c));
  notify();
}

export function useVendors() {
  const [vendors, setVendorsState] = useState<Vendor[]>(() => readVendors());
  const [categories, setCategoriesState] = useState<string[]>(() => readCategories());

  useEffect(() => {
    const sync = () => {
      setVendorsState(readVendors());
      setCategoriesState(readCategories());
    };
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    vendors,
    categories,
    setVendors: (v: Vendor[]) => writeVendors(v),
    setCategories: (c: string[]) => writeCategories(c),
    activeVendorNames: vendors.filter((v) => v.status === "active").map((v) => v.name),
  };
}
