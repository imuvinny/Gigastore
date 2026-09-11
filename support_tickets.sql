CREATE TABLE support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all on support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
