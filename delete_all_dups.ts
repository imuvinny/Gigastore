import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  let allProducts = [];
  let fetchFrom = 0;
  while(true) {
     const { data } = await supabase.from('products').select('id, name').range(fetchFrom, fetchFrom + 999);
     if (!data || data.length === 0) break;
     allProducts.push(...data);
     if (data.length < 1000) break;
     fetchFrom += 1000;
  }
  
  const nameToId = new Map();
  const idsToDelete = [];
  for (const p of allProducts) {
     if (nameToId.has(p.name)) {
        console.log('Duplicate found:', p.name);
        idsToDelete.push(p.id);
     } else {
        nameToId.set(p.name, p.id);
     }
  }
  
  if (idsToDelete.length > 0) {
     console.log(`Deleting ${idsToDelete.length} duplicates...`);
     for (let i = 0; i < idsToDelete.length; i += 100) {
        await supabase.from('products').delete().in('id', idsToDelete.slice(i, i + 100));
     }
     console.log('Done.');
  } else {
     console.log('No duplicates found.');
  }
}
run();
