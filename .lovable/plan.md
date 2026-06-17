# Rencana Implementasi

Empat fitur dibangun di atas database (Lovable Cloud) supaya data persist & multi-user. Dikerjakan dalam 4 fase berurutan agar mudah di-review.

## Fase 1 — Skema Database (1 migrasi besar)

Tabel baru di schema `public` (semua dengan RLS + GRANT lengkap, `id uuid`, `created_at`, `updated_at`):

- **branches** — name, code, address, phone, manager, status, opening_hours
- **employees** — full_name, nik, position, phone, email, status, base_salary, user_id (nullable → link ke `auth.users` kalau karyawan punya login)
- **branch_employees** — branch_id, employee_id, role_in_branch (UNIQUE per pasangan) → satu karyawan bisa di banyak cabang
- **vendors** — name, code, category, contact_person, phone, email, address, payment_terms, status
- **products** — sku, barcode, name, category, unit, cost_price, sell_price, min_stock, image_url, status
- **vendor_products** — vendor_id, product_id, vendor_sku, last_purchase_price, lead_time_days (UNIQUE pasangan)
- **product_batches** — product_id, branch_id, batch_no, expired_date, qty, cost_price, purchase_order_id (nullable)
- **purchase_orders** — po_number (auto), vendor_id, branch_id, status (`draft|sent|received|cancelled`), order_date, expected_date, received_date, subtotal, tax, total, notes, created_by
- **purchase_order_items** — po_id, product_id, qty_ordered, qty_received, cost_price, batch_no, expired_date, carton_barcode

Policies:
- super_admin & admin: full access semua tabel
- staff: SELECT semua, INSERT/UPDATE pada `purchase_orders/_items/product_batches`
- cashier: hanya SELECT `branches`, `products`, `product_batches`

Profile diperluas: tambah kolom `default_branch_id` di `profiles` (nullable). Saat karyawan login POS, default branch dipakai; kalau belum di-set & dia terdaftar di >1 cabang → dialog pilih cabang muncul.

## Fase 2 — Branch Management (#4)

- `src/pages/Branches.tsx`: ganti sumber data dari mock/localStorage ke Supabase
- Modal Add/Edit Branch CRUD nyata; refresh list otomatis (React Query invalidate)
- BranchDetailModal: tab "Karyawan" memakai `branch_employees` (assign/unassign multi-select dari daftar `employees`)

## Fase 3 — Vendor + Produk Vendor (#2)

- `src/pages/Vendors.tsx`: list dari `vendors` table, CRUD nyata
- `VendorDetailModal`: tab baru **"Produk"** menampilkan `vendor_products` join `products`
  - Tombol **"Tambah Produk Existing"** → searchable select dari `products`
  - Tombol **"Tambah Produk Baru"** → form buat row di `products` + `vendor_products` sekaligus (sku, barcode, name, harga, dll.)
  - Per baris: edit `vendor_sku`, `last_purchase_price`, `lead_time_days`; tombol hapus relasi

## Fase 4 — Modul Pembelian (#1)

- Menu sidebar BackOffice → group **"Pembelian"**:
  - `/backoffice/purchasing/po` — daftar PO + filter status/vendor/cabang
  - `/backoffice/purchasing/po/new` — buat PO baru
  - `/backoffice/purchasing/receive/:id` — terima barang
- Buat PO: pilih vendor → produk auto-filter ke `vendor_products` vendor itu; pilih cabang tujuan; tambah baris item; subtotal/pajak/total auto-hitung; simpan `draft` atau `sent`
- Terima Barang (`status=sent` → `received`):
  - Per item: input `qty_received`, `batch_no`, `expired_date`, `carton_barcode`
  - **Scan barcode karton**: input field menerima HID scanner (auto-fokus, Enter submit baris) + tombol **"Scan via Kamera"** (library `@zxing/browser`) sebagai alternatif
  - Saat di-submit: insert ke `product_batches` (qty + expired + branch + cost), update `purchase_orders.status='received'`, `purchase_order_items.qty_received`, `vendor_products.last_purchase_price`

## Fase 5 — POS Login → Cabang (#3)

- `src/hooks/use-auth.tsx`: setelah load profile, query `branch_employees` via `employees.user_id = auth.uid()` → simpan `availableBranches` & `activeBranch` di context
- `ModeSelect` / entry POS:
  - 0 cabang → toast "Akun belum ditugaskan ke cabang"
  - 1 cabang → auto-set `activeBranch`, lanjut ke `/pos`
  - >1 cabang → dialog "Pilih Cabang" sebelum masuk POS
- POS pages (`POS.tsx`, `POSTransactions.tsx`, `ShiftModal.tsx`): semua query/insert di-scope dengan `activeBranch.id`
- UserManagement: form Create User dapat field opsional **"Link ke Karyawan"** (dropdown employees yang belum punya user_id) + **"Default Branch"**

## Detail Teknis

- Library tambahan: `@zxing/browser` untuk scan kamera (lazy-loaded di halaman Receive)
- HID scanner: pakai `<Input autoFocus onKeyDown>` — barcode scanner mengetik cepat + kirim Enter
- React Query untuk semua fetch (auto-invalidate setelah mutate)
- Edge function `admin-create-user` di-update: terima `linked_employee_id` & `default_branch_id`, set ke profile & `employees.user_id`
- File layout baru:
  - `src/pages/purchasing/PurchaseOrders.tsx`
  - `src/pages/purchasing/NewPurchaseOrder.tsx`
  - `src/pages/purchasing/ReceivePurchaseOrder.tsx`
  - `src/components/purchasing/CartonScanner.tsx`
  - `src/components/vendors/VendorProductsTab.tsx`
  - `src/hooks/use-branches.tsx`, `use-vendors.tsx`, `use-products.tsx`, `use-purchase-orders.tsx`

## Catatan Cakupan

- Inventory page (`/backoffice/inventory/products`) tetap pakai mock untuk sekarang — migrasi ke `products` table di iterasi berikutnya supaya PR ini tidak terlalu besar. Produk yang dibuat lewat vendor & PO tetap masuk ke table `products` dan terlihat di Inventory lewat join terpisah nanti.
- Stok di POS untuk sementara tetap dari mock; integrasi penuh stok dari `product_batches` (FIFO by expired) menyusul.

Setujui rencana ini dan saya mulai dari Fase 1 (migrasi database).