import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const response = await fetch(`https://www.plug.tech/collections/androids/products.json?limit=250&currency=ZMW`);
  const data = await response.json();
  const products = data.products;
  for (const item of products) {
      if (!item.title.includes('Google Pixel 9 Obsidian')) continue;
      
      let name = item.title;
      const availableVariants = (item.variants || []).filter((v: any) => v.available !== false);
      console.log('Available variants:', availableVariants.length);
      
      const colorOptionsMap = new Map();
      let basePrice = Infinity;
      if (item.variants) {
        item.variants.forEach((v: any) => {
          let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
          // Just a dummy margin
          let vPrice = Math.round(rawPlugZmw) + 100;
          if (vPrice < basePrice && v.available !== false) basePrice = vPrice;
          
          let color = null;
          let storage = null;
          let connectivity = null;
          let condition = null;
          
          const opts = (v.title || '').split(' / ').map(s => s.trim());
          opts.forEach(opt => {
            if (['Good', 'Great', 'Excellent', 'Flawless'].includes(opt)) condition = opt;
            else if (opt.includes('GB') || opt.includes('TB')) storage = opt;
            else if (opt.toLowerCase().includes('wifi') || opt.toLowerCase().includes('wi-fi') || opt.toLowerCase().includes('cellular') || opt.toLowerCase().includes('unlocked') || opt.toLowerCase().includes('verizon') || opt.toLowerCase().includes('t-mobile') || opt.toLowerCase().includes('at&t')) connectivity = opt;
            else if (opt !== 'Default Title') color = opt;
          });
          
          if (!color) color = "Default";
          if (!storage) storage = "128GB";
          if (!condition) condition = "Great";
          console.log('Parsed variant:', {title: v.title, color, storage, condition, connectivity, vPrice});
        });
      }
      console.log('Base price calculated:', basePrice);
  }
}
test();
