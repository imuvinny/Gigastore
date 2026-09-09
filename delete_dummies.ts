import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('products').select('id, name, colors');
  const idsToDelete = [];
  for (const d of data) {
    if (d.colors && typeof d.colors[0] === 'string' && d.colors[0] === '#000000') {
      console.log('Deleting dummy:', d.name);
      idsToDelete.push(d.id);
    }
  }
  if (idsToDelete.length > 0) {
    await supabase.from('products').delete().in('id', idsToDelete);
  }
}
run();
