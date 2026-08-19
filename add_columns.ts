import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = `
    ALTER TABLE products ADD COLUMN IF NOT EXISTS storages text[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS conditions jsonb;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS "manualMarginZMW" numeric;
  `;
  const { data, error } = await supabase.rpc('execute_sql', { sql: query });
  console.log(error);
}
run();
