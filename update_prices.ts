import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const getProfitMarginZMW = (p: { name: string; brand?: string; price?: number }) => {
  const n = (p.name || '').toLowerCase();
  const c = (p.brand || '').toLowerCase();
  
  if (c === 'accessories') {
    const price = p.price || 0;
    if (price < 150) return 50;
    if (price >= 150 && price < 300) return 100;
    if (price >= 300 && price < 500) return 150;
    if (price >= 500 && price < 900) return 250;
    if (price >= 900 && price < 1000) return 250;
    return 400; // >= 1000
  }
  
  if (n.includes('macbook') || n.includes('laptop') || n.includes('pc') || c.includes('macbook') || c.includes('laptop')) return 2000;
  if (n.includes('ipad') || n.includes('tablet') || n.includes('galaxy tab') || c.includes('ipad') || c.includes('tablet')) return 500;
  if (n.includes('speaker') || n.includes('pill') || n.includes('flip') || c.includes('speaker')) return 400;
  if (n.includes('watch') || c.includes('watch')) return 300;
  
  const isEarbudOrEarpod = n.includes('earpod') || n.includes('earbud') || n.includes('buds') || n.includes('airpods') || n.includes('true wireless') || n.includes('powerbeats fit') || n.includes('powerbeats pro') || c.includes('earpod') || c.includes('earbud');
  if (isEarbudOrEarpod) return 100;
  
  const isHeadphone = n.includes('headphone') || n.includes('beats solo') || n.includes('tune 670nc') || n.includes('tune 770nc') || n.includes('wi-c100') || c.includes('headphone');
  if (isHeadphone) return 200;
  
  const isPhone = n.includes('iphone') || n.includes('pixel') || (n.includes('galaxy') && !n.includes('bud') && !n.includes('watch') && !n.includes('tab')) || n.includes('android') || /\bphone(s)?\b/i.test(n) || (/\bphone(s)?\b/i.test(c) && !c.includes('headphone'));
  if (isPhone) return 600;
  
  return 100;
};

async function run() {
  let page = 1;
  const updates = [];
  while(true) {
    console.log(`Page ${page}`);
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { headers: { "Cookie": "cart_currency=ZMW" } });
    const data = await response.json();
    if(!data.products || data.products.length === 0) break;
    
    for(const item of data.products) {
      let name = item.title;
      if (name) {
        name = name.replace(/plug\s*-\s*/i, '');
        name = name.replace(/\bplug\b/ig, '').trim();
      }
      
      let basePrice = Infinity;
      if (item.variants) {
        item.variants.forEach((v: any) => {
          let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
          // Just approximate the brand for profit calculation based on name
          const margin = getProfitMarginZMW({ name: name, brand: '', price: rawPlugZmw });
          let vPrice = Math.round(rawPlugZmw) + margin;
          if (vPrice < basePrice) basePrice = vPrice;
        });
      }
      
      if (basePrice !== Infinity) {
        updates.push({ name, price: basePrice });
      }
    }
    page++;
  }
  
  console.log(`Found ${updates.length} products to update`);
  
  // We'll update the database directly for existing products
  let updatedCount = 0;
  for (let i = 0; i < updates.length; i += 50) {
     const batch = updates.slice(i, i + 50);
     for (const up of batch) {
         await supabase.from('products').update({ price: up.price }).eq('name', up.name);
         updatedCount++;
     }
  }
  console.log(`Finished updating prices for ${updatedCount} items.`);
}
run();
