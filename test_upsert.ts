import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const response = await fetch(`https://www.plug.tech/collections/androids/products.json?limit=250&currency=ZMW`);
  const data = await response.json();
  const products = data.products;
  const toUpsert = [];
  
  for (const item of products) {
      if (!item.title.includes('Google Pixel 9') && !item.title.includes('Pixel 10a') && !item.title.includes('Pixel 8a')) continue;
      
      let name = item.title;
      const basePrice = 8720;
      toUpsert.push({
          id: crypto.randomUUID(),
          name,
          brand: 'Google Phones',
          price: basePrice,
          image: item.images[0]?.src || '',
          description: 'test',
          colors: ['#000000'],
          accentColor: '#3ecf8e'
      });
  }
  
  console.log('toUpsert:', toUpsert.map(u => u.name));
  const { error } = await supabase.from('products').upsert(toUpsert);
  console.log('error?', error);
}
test();
