import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const collections = [
    "apple-iphones",
    "apple-watches",
    "apple-ipads",
    "macbooks",
    "airpods",
    "headphones",
    "androids"
  ];
  
  let addedCount = 0;
  
  for (const collection of collections) {
    console.log(`Fetching from collection: ${collection}`);
    const response = await fetch(`https://www.plug.tech/collections/${collection}/products.json?limit=250&currency=ZMW&_t=${Date.now()}`);
    if (!response.ok) continue;
    
    const data = await response.json();
    const products = data.products;
    
    for (const item of products) {
      const name = item.title;
      if(name.includes('Starter Pack')) continue;
      
      const image = item.images && item.images.length > 0 ? item.images[0].src : '';
      const description = (item.body_html || '').replace(/(<([^>]+)?>)/gi, "");
      const brandMap: Record<string, string> = {
        "apple-iphones": "Apple Phones",
        "apple-watches": "Apple Watches",
        "apple-ipads": "iPads",
        "macbooks": "MacBooks",
        "airpods": "AirPods",
        "headphones": "Headphones",
        "androids": "Samsung Phones"
      };
      let brand = brandMap[collection] || 'Other';
      if (collection === 'androids') {
        if (item.vendor === 'Google' || item.title.includes('Pixel')) {
          brand = 'Google Phones';
        } else if (item.vendor === 'Samsung' || item.title.includes('Galaxy')) {
          brand = 'Samsung Phones';
        } else {
          brand = 'Android Phones';
        }
      } else if (collection === 'headphones' || collection === 'airpods') {
        const t = item.title.toLowerCase();
        if (t.includes('speaker') || t.includes('pill') || item.vendor === 'JBL') {
          brand = 'Speakers';
        } else if (item.vendor === 'Beats') {
          brand = 'Headphones';
        }
      }
      const accentColor = '#3ecf8e';
      
            // Extract colors, storages, conditions
      const colorToHex = (colorName) => {
        const c = (colorName || '').toLowerCase();
        if (c.includes('black') || c.includes('midnight') || c.includes('space')) return '#1a1a1a';
        if (c.includes('white') || c.includes('starlight') || c.includes('silver')) return '#f3f3f3';
        if (c.includes('red')) return '#ff3b30';
        if (c.includes('blue') || c.includes('pacific') || c.includes('sierra') || c.includes('ultramarine')) return '#215e7c';
        if (c.includes('green') || c.includes('alpine') || c.includes('mint') || c.includes('teal')) return '#a3e4d7';
        if (c.includes('pink') || c.includes('rose')) return '#f5b7b1';
        if (c.includes('yellow')) return '#f9e79f';
        if (c.includes('purple')) return '#4b2e5c';
        if (c.includes('gold')) return '#ffd700';
        if (c.includes('graphite')) return '#4a4a4a';
        if (c.includes('titanium')) return '#878681';
        return '#cccccc';
      };

      const colorOptionsMap = new Map();
      let basePrice = Infinity;

      if (item.variants) {
        item.variants.forEach((v) => {
          const vPrice = parseFloat(v.price);
          if (vPrice < basePrice) basePrice = vPrice;
          
          let color = null;
          let storage = null;
          let condition = null;
          
          const opts = [v.option1, v.option2, v.option3].filter(Boolean).map(s => s.trim());
          opts.forEach(opt => {
            if (['Good', 'Great', 'Excellent', 'Flawless'].includes(opt)) condition = opt;
            else if (opt.includes('GB') || opt.includes('TB')) storage = opt;
            else if (opt !== 'Default Title') color = opt;
          });
          
          if (!color) color = "Default";
          if (!storage) storage = "128GB";
          if (!condition) condition = "Great";
          
          if (!colorOptionsMap.has(color)) {
            let imgUrl = image;
            const colorLower = color.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (item.images) {
              const matchedImg = item.images.find(img => img.src && img.src.toLowerCase().replace(/[^a-z0-9]/g, '').includes(colorLower));
              if (matchedImg) imgUrl = matchedImg.src;
            }
            
            colorOptionsMap.set(color, {
              name: color,
              hex: colorToHex(color),
              image: imgUrl,
              storagesMap: new Map()
            });
          }
          
          const cData = colorOptionsMap.get(color);
          if (!cData.storagesMap.has(storage)) {
            cData.storagesMap.set(storage, new Map());
          }
          
          const sData = cData.storagesMap.get(storage);
          sData.set(condition, {
            name: condition,
            price: vPrice,
            available: v.available
          });
        });
      }

      if (basePrice === Infinity) basePrice = 0;

      const colorsArray = Array.from(colorOptionsMap.values()).map(c => ({
        name: c.name,
        hex: c.hex,
        image: c.image,
        storages: Array.from(c.storagesMap.entries()).map(([sName, condMap]) => ({
          name: sName,
          conditions: Array.from(condMap.values())
        }))
      })).map(obj => JSON.stringify(obj));

      if (colorsArray.length === 0) {
        colorsArray.push('#000000', '#ffffff', '#ff0000');
      }
      
      const newProductData = {
        name,
        brand,
        price: basePrice,
        image,
        description,
        colors: colorsArray,
        
        
        accentColor
      };

      const { error: insertError } = await supabase.from('products').insert([newProductData]);
      if (!insertError) addedCount++;
      else console.log(insertError.message);
    }
  }
  console.log("Added", addedCount);
}
run();
