import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const r = await fetch("https://www.plug.tech/products.json?limit=250&page=4&currency=ZMW");
  const d = await r.json();
  const item = d.products.find(x => x.title.includes("iPhone 12 Pro Max"));
  if(item) {
     let name = item.title.replace(/plug\s*-\s*/i, '').replace(/\bplug\b/ig, '').trim();
     
     // construct colors array logic exactly like server
     const colorOptionsMap = new Map();
     let basePrice = Infinity;
     item.variants.forEach(v => {
          let condition = 'Good';
          let storage = '';
          let connectivity = '';
          let color = 'Default';
          const opts = (v.title || '').split(' / ').map(s => s.trim());
          opts.forEach(opt => {
            if (['Good', 'Great', 'Excellent', 'Flawless'].includes(opt)) condition = opt;
            else if (opt.includes('GB') || opt.includes('TB')) storage = opt;
            else if (opt.toLowerCase().includes('wifi') || opt.toLowerCase().includes('wi-fi') || opt.toLowerCase().includes('cellular') || opt.toLowerCase().includes('unlocked') || opt.toLowerCase().includes('verizon') || opt.toLowerCase().includes('t-mobile') || opt.toLowerCase().includes('at&t')) connectivity = opt;
            else if (opt !== 'Default Title') color = opt;
          });
          
          let vPrice = parseFloat(v.price) || 0;
          if (vPrice > 0 && vPrice < basePrice) basePrice = vPrice;
          
          if (!colorOptionsMap.has(color)) {
              colorOptionsMap.set(color, {
                  name: color,
                  hex: '#000000',
                  image: '',
                  images: [],
                  storagesMap: new Map()
              });
          }
          const cData = colorOptionsMap.get(color);
          
          if (!cData.storagesMap.has(storage)) {
              cData.storagesMap.set(storage, {
                  name: storage,
                  connectivitiesMap: new Map(),
                  conditionsMap: new Map()
              });
          }
          const sData = cData.storagesMap.get(storage);
          
          if (connectivity) {
              if (!sData.connectivitiesMap.has(connectivity)) {
                  sData.connectivitiesMap.set(connectivity, new Map());
              }
              const connData = sData.connectivitiesMap.get(connectivity);
              connData.set(condition, {
                  name: condition,
                  price: vPrice,
                  available: v.available
              });
          } else {
              sData.conditionsMap.set(condition, {
                  name: condition,
                  price: vPrice,
                  available: v.available
              });
          }
     });
     if (basePrice === Infinity) basePrice = 0;
     const colorsArray = Array.from(colorOptionsMap.values()).map((c: any) => ({
        name: c.name,
        hex: c.hex,
        image: c.image,
        images: c.images && c.images.length > 0 ? c.images : [c.image],
        storages: Array.from(c.storagesMap.values()).map((sData: any) => ({
          name: sData.name,
          connectivities: sData.connectivitiesMap.size > 0 ? Array.from(sData.connectivitiesMap.entries()).map(([cName, condMap]) => ({ 
             name: cName, 
             conditions: Array.from(condMap.values()) 
          })) : undefined,
          conditions: sData.conditionsMap.size > 0 ? Array.from(sData.conditionsMap.values()) : undefined
        }))
      })).map(obj => JSON.stringify(obj));
     
     const newProductData = {
        name,
        brand: 'Apple Phones',
        price: basePrice,
        image: '',
        description: '',
        colors: colorsArray,
        accentColor: '#3ecf8e'
     };
     
     const { data, error } = await supabase.from('products').insert([newProductData]);
     console.log("Insert result:", error || "Success");
  }
}
run();
