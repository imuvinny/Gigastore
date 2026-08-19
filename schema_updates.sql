CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_price numeric NOT NULL,
  status text DEFAULT 'pending',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  delivery_address text NOT NULL,
  delivery_city text NOT NULL,
  delivery_postal_code text,
  delivery_phone text NOT NULL,
  delivery_country text NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Orders" ON orders;
CREATE POLICY "Public Select Orders" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Orders" ON orders;
CREATE POLICY "Public Update Orders" ON orders FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Delete Orders" ON orders;
CREATE POLICY "Public Delete Orders" ON orders FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  page_path text NOT NULL,
  visitor_id text NOT NULL
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Visits" ON visits;
CREATE POLICY "Public Select Visits" ON visits FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Visits" ON visits;
CREATE POLICY "Public Insert Visits" ON visits FOR INSERT WITH CHECK (true);
