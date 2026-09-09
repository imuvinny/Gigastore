import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const syncedProductNames = new Set<string>();
  let page = 1;
  let hasMore = true;
  while(hasMore) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", 
        "Accept": "application/json",
        "Cookie": "cart_currency=ZMW"
      } 
    });
    const data = await response.json();
    const products = data.products;
    for (const item of products) {
        let name = item.title;
      // Remove the word "Plug" (case-insensitive) from the title
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
      
      syncedProductNames.add(name);
      
      if (name.includes('Pixel')) {
          console.log('Pixel found:', name);
      }
    }
    if (products.length < 250) hasMore = false;
    else page++;
  }
}
test();
