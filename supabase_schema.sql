CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  image text NOT NULL,
  description text,
  colors text[],
  "accentColor" text
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Products" ON products;
CREATE POLICY "Public Select Products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Products" ON products;
CREATE POLICY "Public Insert Products" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Products" ON products;
CREATE POLICY "Public Update Products" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Products" ON products;
CREATE POLICY "Public Delete Products" ON products FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS slides (
  id serial PRIMARY KEY,
  "titleLines" text[],
  "accentText" text NOT NULL,
  specs text,
  color text NOT NULL,
  image text NOT NULL
);

ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Slides" ON slides;
CREATE POLICY "Public Select Slides" ON slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Slides" ON slides;
CREATE POLICY "Public Insert Slides" ON slides FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Slides" ON slides;
CREATE POLICY "Public Update Slides" ON slides FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Delete Slides" ON slides;
CREATE POLICY "Public Delete Slides" ON slides FOR DELETE USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');

INSERT INTO products (name, brand, price, image, description, colors, "accentColor")
VALUES 
('iPhone 15 Pro Max Space Black', 'Apple', 1199, 'https://images.unsplash.com/photo-1611791485440-24e8fc395914?auto=format&fit=crop&q=80&w=600', 'Pro Camera. 12GB RAM. All-day Battery.', ARRAY['#1A1A1A', '#F3F3F3', '#4B4B4B']::text[], '#ffffff'),
('iPhone 15 Pro Silver', 'Apple', 999, 'https://images.unsplash.com/photo-1611404179374-124b8989a3df?auto=format&fit=crop&q=80&w=600', 'A total powerhouse with an advanced dual-camera system.', ARRAY['#F3F3F3', '#1A1A1A', '#4B4B4B']::text[], '#e0e0e0'),
('iPhone 14 Pro Deep Purple', 'Apple', 1099, 'https://images.unsplash.com/photo-1664478546384-d57ffe74a195?auto=format&fit=crop&q=80&w=600', 'Forged in titanium. A monumental leap in performance.', ARRAY['#4B2E5C', '#1A1A1A', '#F3F3F3']::text[], '#a855f7'),
('iPhone 15 Mint Green', 'Apple', 799, 'https://images.unsplash.com/photo-1591337676273-9bf4639b56da?auto=format&fit=crop&q=80&w=600', 'The all-new mint edition. Bright. New. Better.', ARRAY['#98FF98', '#1A1A1A', '#F3F3F3']::text[], '#4ade80');

INSERT INTO slides ("titleLines", "accentText", specs, color, image)
VALUES
(ARRAY['WHO WANTS THE', 'BEST-SELLING PHONE?']::text[], 'THE IPHONE 15 PRO IN DEEP PURPLE.', 'Pro Camera. 12GB RAM. All-day Battery.', '#a855f7', 'https://images.unsplash.com/photo-1664478546384-d57ffe74a195?auto=format&fit=crop&q=80&w=1200'),
(ARRAY['BRIGHT.', 'NEW.', 'BETTER.']::text[], 'THE ALL-NEW IPHONE 15 IN MINT GREEN.', 'Next-gen processor. Ultra-bright display.', '#4ade80', 'https://images.unsplash.com/photo-1591337676273-9bf4639b56da?auto=format&fit=crop&q=80&w=1200');
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

-- Dedicated Company Earnings Log Table
CREATE TABLE IF NOT EXISTS company_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  gross_amount numeric NOT NULL DEFAULT 0,
  net_profit numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZMW',
  notes text
);

ALTER TABLE company_earnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Company Earnings" ON company_earnings;
CREATE POLICY "Public Select Company Earnings" ON company_earnings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Company Earnings" ON company_earnings;
CREATE POLICY "Public Insert Company Earnings" ON company_earnings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Company Earnings" ON company_earnings;
CREATE POLICY "Public Update Company Earnings" ON company_earnings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Delete Company Earnings" ON company_earnings;
CREATE POLICY "Public Delete Company Earnings" ON company_earnings FOR DELETE USING (true);


-- Sync Logs Table
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL,
  added_count integer DEFAULT 0,
  updated_count integer DEFAULT 0,
  deleted_count integer DEFAULT 0,
  added_items jsonb DEFAULT '[]',
  updated_items jsonb DEFAULT '[]',
  deleted_items jsonb DEFAULT '[]',
  error_message text
);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Sync Logs" ON sync_logs;
CREATE POLICY "Public Select Sync Logs" ON sync_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Sync Logs" ON sync_logs;
CREATE POLICY "Public Insert Sync Logs" ON sync_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Delete Sync Logs" ON sync_logs;
CREATE POLICY "Public Delete Sync Logs" ON sync_logs FOR DELETE USING (true);
