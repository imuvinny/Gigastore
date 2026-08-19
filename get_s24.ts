import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data } = await supabase.from('products').select('name, price, colors').ilike('name', '%S24 Ultra 5G 512GB - Titanium Gray%');
  for (const p of data || []) {
      console.log(p.name, p.price);
      if (p.colors && p.colors.length > 0) {
        console.log(JSON.stringify(JSON.parse(p.colors[0]), null, 2));
      }
  }
}
run();
