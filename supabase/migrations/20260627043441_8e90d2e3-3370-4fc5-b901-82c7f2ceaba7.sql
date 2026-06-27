
-- Employees: restrict SELECT
DROP POLICY IF EXISTS "employees read auth" ON public.employees;
CREATE POLICY "employees read staff" ON public.employees
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'admin')
    OR user_id = auth.uid()
  );

-- Vendors: restrict SELECT
DROP POLICY IF EXISTS "vendors read auth" ON public.vendors;
CREATE POLICY "vendors read staff" ON public.vendors
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'staff')
  );

-- Product batches: restrict SELECT
DROP POLICY IF EXISTS "pb read auth" ON public.product_batches;
CREATE POLICY "pb read staff" ON public.product_batches
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'staff')
  );

-- Purchase orders: restrict SELECT
DROP POLICY IF EXISTS "po read auth" ON public.purchase_orders;
CREATE POLICY "po read staff" ON public.purchase_orders
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'staff')
  );

-- Purchase order items: restrict SELECT
DROP POLICY IF EXISTS "poi read auth" ON public.purchase_order_items;
CREATE POLICY "poi read staff" ON public.purchase_order_items
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'staff')
  );

-- Convert get_current_role to SECURITY INVOKER (relies on user_roles SELECT policy)
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'staff' THEN 3
    WHEN 'cashier' THEN 4
  END
  LIMIT 1
$$;
