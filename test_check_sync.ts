import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: logs } = await supabase.from('sync_logs').select('*').order('timestamp', { ascending: false }).limit(1);
  console.log(logs);
}
run();
