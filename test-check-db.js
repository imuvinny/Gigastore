import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: macbooks } = await supabase.from('products').select('name, price').ilike('name', '%MacBook%').limit(1);
  console.log('MacBook:', macbooks);

  const { data: ipads } = await supabase.from('products').select('name, price').ilike('name', '%iPad%').limit(1);
  console.log('iPad:', ipads);

  const { data: accs } = await supabase.from('products').select('name, price').eq('brand', 'Accessories').limit(2);
  console.log('Accessories:', accs);
}
run();
