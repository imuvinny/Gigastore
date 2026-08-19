-- Run this in your Supabase SQL Editor

-- 1. Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 2. Enable RLS on wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 3. Wishlist RLS Policies
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
CREATE POLICY "Users can view their own wishlist" ON public.wishlist 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their own wishlist" ON public.wishlist;
CREATE POLICY "Users can insert into their own wishlist" ON public.wishlist 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own wishlist" ON public.wishlist;
CREATE POLICY "Users can delete from their own wishlist" ON public.wishlist 
FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable RLS on orders (if not already enabled)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Orders RLS Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders 
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Add policy for admins to view all orders (assuming admins check email or role, adjust as needed)
-- CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (true); 

-- 6. Create settings table for global app configuration (e.g., social links)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Settings RLS Policies
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);

-- Admins can update settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can update settings" ON public.settings FOR ALL USING (auth.jwt() ->> 'email' = 'vincentlewa6@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'vincentlewa6@gmail.com');
