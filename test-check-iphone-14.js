import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: iphones } = await supabase.from('products').select('name, price, colors').ilike('name', '%iPhone 12 Pro Max (Unlocked)%');
  const colors = JSON.parse(iphones[0].colors[0]);
  console.log('iPhone 12 Pro Max DB price:', iphones[0].price);
  
  const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`, { headers: { "Cookie": "cart_currency=ZMW" }});
  const data = await res.json();
  // find in plugtech ZMW
  let found = false;
  for (let i=1; i<=10; i++) {
     const p_res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${i}&currency=ZMW`, { headers: { "Cookie": "cart_currency=ZMW" }});
     const p_data = await p_res.json();
     if (!p_data.products) break;
     for (const p of p_data.products) {
        if (p.title === 'Apple iPhone 12 Pro Max (Unlocked)' || p.title === 'iPhone 12 Pro Max (Unlocked)') {
            console.log('PlugTech iPhone 12 Pro Max (ZMW) variant 0:', p.variants[0].price);
            found = true;
            break;
        }
     }
     if(found) break;
  }
}
run();
