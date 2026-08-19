-- Run this in your Supabase SQL Editor

-- 1. Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Add image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'image_url') THEN
        ALTER TABLE public.orders ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 3. Enable RLS if not already enabled (optional but good practice)
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create a policy for users to see their own orders
-- DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
-- CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
