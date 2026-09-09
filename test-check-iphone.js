import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: iphones } = await supabase.from('products').select('name, price').ilike('name', '%iPhone 13 Pro%').limit(5);
  console.log('iPhones in DB:', JSON.stringify(iphones, null, 2));
}
run();
