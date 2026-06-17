
-- =========================
-- helper: updated_at trigger (already exists as touch_updated_at)
-- =========================

-- =========================
-- BRANCHES
-- =========================
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  address text,
  phone text,
  manager text,
  opening_hours text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches read all auth" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "branches admin write" ON public.branches FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "branches admin update" ON public.branches FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "branches admin delete" ON public.branches FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- EMPLOYEES
-- =========================
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  full_name text NOT NULL,
  nik text,
  position text,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'active',
  base_salary numeric(14,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees read auth" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "employees admin write" ON public.employees FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "employees admin update" ON public.employees FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "employees admin delete" ON public.employees FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- BRANCH <-> EMPLOYEES
-- =========================
CREATE TABLE public.branch_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  role_in_branch text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, employee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branch_employees TO authenticated;
GRANT ALL ON public.branch_employees TO service_role;
ALTER TABLE public.branch_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "be read auth" ON public.branch_employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "be admin write" ON public.branch_employees FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "be admin update" ON public.branch_employees FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "be admin delete" ON public.branch_employees FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));

-- =========================
-- VENDORS
-- =========================
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  category text,
  contact_person text,
  phone text,
  email text,
  address text,
  payment_terms text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors read auth" ON public.vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "vendors admin write" ON public.vendors FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "vendors admin update" ON public.vendors FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "vendors admin delete" ON public.vendors FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  barcode text,
  name text NOT NULL,
  category text,
  unit text DEFAULT 'pcs',
  cost_price numeric(14,2) DEFAULT 0,
  sell_price numeric(14,2) DEFAULT 0,
  min_stock integer DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products read auth" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products bo write" ON public.products FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "products bo update" ON public.products FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "products admin delete" ON public.products FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- VENDOR <-> PRODUCTS
-- =========================
CREATE TABLE public.vendor_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_sku text,
  last_purchase_price numeric(14,2) DEFAULT 0,
  lead_time_days integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_products TO authenticated;
GRANT ALL ON public.vendor_products TO service_role;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vp read auth" ON public.vendor_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "vp bo write" ON public.vendor_products FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "vp bo update" ON public.vendor_products FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "vp admin delete" ON public.vendor_products FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_vp_updated BEFORE UPDATE ON public.vendor_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- PURCHASE ORDERS
-- =========================
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL DEFAULT ('PO-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  status text NOT NULL DEFAULT 'draft',
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_date date,
  received_date date,
  subtotal numeric(14,2) DEFAULT 0,
  tax numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "po read auth" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "po bo write" ON public.purchase_orders FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "po bo update" ON public.purchase_orders FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "po admin delete" ON public.purchase_orders FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_po_updated BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- PURCHASE ORDER ITEMS
-- =========================
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  qty_ordered numeric(14,2) NOT NULL DEFAULT 0,
  qty_received numeric(14,2) NOT NULL DEFAULT 0,
  cost_price numeric(14,2) NOT NULL DEFAULT 0,
  batch_no text,
  expired_date date,
  carton_barcode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.purchase_order_items TO service_role;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poi read auth" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "poi bo write" ON public.purchase_order_items FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "poi bo update" ON public.purchase_order_items FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "poi bo delete" ON public.purchase_order_items FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE TRIGGER trg_poi_updated BEFORE UPDATE ON public.purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- PRODUCT BATCHES
-- =========================
CREATE TABLE public.product_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  batch_no text,
  expired_date date,
  qty numeric(14,2) NOT NULL DEFAULT 0,
  cost_price numeric(14,2) DEFAULT 0,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  carton_barcode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_batches TO authenticated;
GRANT ALL ON public.product_batches TO service_role;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb read auth" ON public.product_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "pb bo write" ON public.product_batches FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "pb bo update" ON public.product_batches FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "pb admin delete" ON public.product_batches FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pb_updated BEFORE UPDATE ON public.product_batches
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- PROFILES: default_branch_id
-- =========================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;

-- =========================
-- Indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_be_employee ON public.branch_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_be_branch ON public.branch_employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_vp_vendor ON public.vendor_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vp_product ON public.vendor_products(product_id);
CREATE INDEX IF NOT EXISTS idx_poi_po ON public.purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_pb_product ON public.product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_pb_branch ON public.product_batches(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(user_id);
