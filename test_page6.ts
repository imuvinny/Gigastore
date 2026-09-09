import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=6&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
  const data = await response.json();
  const products = data.products;
  const toUpsert = [];
  
  for (const item of products) {
      let name = item.title;
      if (name) {
        name = name.replace(/plug\s*-\s*/i, '');
        name = name.replace(/\bplug\b/ig, '').trim();
      }
      const availableVariants = (item.variants || []).filter((v: any) => v.available !== false);
      if (availableVariants.length === 0) continue;
      
      let basePrice = Infinity;
      item.variants.forEach((v: any) => {
          let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
          let vPrice = Math.round(rawPlugZmw) + 500;
          if (vPrice < basePrice && v.available !== false) basePrice = vPrice;
      });
      
      toUpsert.push({
          id: crypto.randomUUID(),
          name,
          brand: 'Other',
          price: basePrice,
          image: item.images[0]?.src || '',
          description: '',
          colors: [],
          accentColor: '#3ecf8e'
      });
  }
  
  const { error } = await supabase.from('products').upsert(toUpsert);
  console.log('Batch upsert error for page 6:', error);
}
test();
