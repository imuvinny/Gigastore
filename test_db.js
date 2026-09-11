import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
const urlMatch = content.match(/createClient\(['"]([^'"]+)['"]/);
const keyMatch = content.match(/,\s*['"]([^'"]+)['"]\)/);

if (urlMatch && keyMatch) {
  const supabaseUrl = urlMatch[1];
  const supabaseKey = keyMatch[1];
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function run() {
    const { data, error } = await supabase.from('notifications').insert({
      customer_email: 'SUPPORT_TICKET',
      message: 'test'
    });
    console.log("Error:", error);
  }
  run();
}
