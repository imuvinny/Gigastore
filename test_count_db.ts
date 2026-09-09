import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('products').select('*');
  console.log('Without pagination:', data.length);
  
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log('Total count:', count);
}
run();
