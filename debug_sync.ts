import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const r = await fetch("https://www.plug.tech/products.json?limit=250&page=4&currency=ZMW");
  const d = await r.json();
  const item = d.products.find(x => x.title.includes("iPhone 12 Pro Max"));
  console.log("Found:", !!item);
  if(item) {
     let name = item.title;
     if (name) {
        name = name.replace(/plug\s*-\s*/i, '');
        name = name.replace(/\bplug\b/ig, '').trim();
     }
     console.log("Name:", name);
     // let's try to find it in db
     const { data } = await supabase.from('products').select('*').eq('name', name);
     console.log("In DB:", data?.length);
  }
}
run();
