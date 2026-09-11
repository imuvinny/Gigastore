import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
const urlMatch = content.match(/createClient\(['"]([^'"]+)['"]/);
const keyMatch = content.match(/import\.meta\.env\.VITE_SUPABASE_ANON_KEY/);

if (urlMatch && keyMatch) {
  const supabaseUrl = urlMatch[1];
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    console.log("No key found in .env");
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function run() {
    console.log("Checking support_tickets table...");
    const { data, error } = await supabase.from('support_tickets').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
  }
  run();
}
