import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);


async function test() {
  const syncedProductNames = new Set<string>();
  const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=16&currency=ZMW`, { 
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
      const lowerName = name.toLowerCase();
      if (lowerName.includes('airpods max') || lowerName.includes('sleeve') || lowerName.includes('backpack') || lowerName.includes('mystery box') || lowerName.includes('boost mobile') || lowerName.includes('connected pack')) {
          continue;
      }
      
      const availableVariants = (item.variants || []).filter((v: any) => v.available !== false);
      if (availableVariants.length === 0) continue;
      if (syncedProductNames.has(name)) continue;
      
      let basePrice = Infinity;
      let brand = 'Other';
      const v = item.vendor || '';
      const t = item.product_type || '';
      const lowerNameForCat = name.toLowerCase();
      
      if (v === 'Google' || name.includes('Pixel')) brand = 'Google Phones';
      
      item.variants.forEach((v: any) => {
          let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
          // Simple margin calculation for test
          const margin = 500; 
          let vPrice = Math.round(rawPlugZmw) + margin;
          if (vPrice < basePrice && v.available !== false) basePrice = vPrice;
      });
      
      syncedProductNames.add(name);
      
      toUpsert.push({
          id: crypto.randomUUID(),
          name,
          brand,
          price: basePrice,
          image: item.images[0]?.src || '',
          description: '',
          colors: [],
          accentColor: '#3ecf8e'
      });
  }
  
  const { error } = await supabase.from('products').upsert(toUpsert);
  console.log('Batch upsert error:', error);
}
test();
