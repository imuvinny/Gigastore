import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qiiqvglngqigktyxyiwo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.storage.from('images').list();
  console.log('List:', data, error);
}

main();
