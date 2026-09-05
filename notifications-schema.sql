-- Run this in your Supabase SQL Editor to enable Notifications

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = customer_email);

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = customer_email);

-- Allow inserting notifications (Admin can do this via anon key if we don't have service_role, but ideally admin uses service_role or a specific policy)
-- For the sake of the preview, we can allow authenticated users to insert (assuming admins are authenticated)
CREATE POLICY "Allow authenticated to insert"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
