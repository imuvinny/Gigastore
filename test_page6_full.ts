import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);


async function test() {
  const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=6&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
  const data = await response.json();
  const products = data.products;
  const toUpsert = [];
  
  for (const item of products) {
      if (!item.title.includes('Pixel 10a')) continue;
      
      let name = item.title;
      const colorOptionsMap = new Map();
      let basePrice = Infinity;
      if (item.variants) {
        item.variants.forEach((v: any) => {
          let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
          let vPrice = Math.round(rawPlugZmw) + 500;
          if (vPrice < basePrice && v.available !== false) basePrice = vPrice;
          
          let color = "Default";
          let storage = "128GB";
          let condition = "Great";
          let connectivity = null;
          
          if (!colorOptionsMap.has(color)) {
            colorOptionsMap.set(color, {
              name: color, hex: '#cccccc', image: '', images: [], storagesMap: new Map()
            });
          }
          const cData = colorOptionsMap.get(color);
          if (!cData.storagesMap.has(storage)) {
            cData.storagesMap.set(storage, { name: storage, connectivitiesMap: new Map(), conditionsMap: new Map() });
          }
          const sData = cData.storagesMap.get(storage);
          if (!sData.conditionsMap.has(condition)) {
            sData.conditionsMap.set(condition, { name: condition, price: vPrice, available: v.available });
          }
        });
      }
      
      let colorsArray = [];
      if (colorOptionsMap.size > 0) {
          colorsArray = Array.from(colorOptionsMap.values()).map((cData: any) => {
            const storages = Array.from(cData.storagesMap.values()).map((sData: any) => {
              const connectivities = Array.from(sData.connectivitiesMap.entries()).map(([cName, cMap]: any) => {
                  return { name: cName, conditions: Array.from(cMap.values()) };
              });
              return { name: sData.name, connectivities: connectivities, conditions: Array.from(sData.conditionsMap.values()) };
            });
            return { name: cData.name, hex: cData.hex, image: cData.image, images: cData.images, storages: storages };
          });
      }
      
      toUpsert.push({
          id: crypto.randomUUID(),
          name,
          brand: 'Google Phones',
          price: basePrice,
          image: item.images[0]?.src || '',
          description: '',
          colors: colorsArray,
          accentColor: '#3ecf8e'
      });
  }
  
  console.log(JSON.stringify(toUpsert, null, 2));
  const { error } = await supabase.from('products').upsert(toUpsert);
  console.log('Batch upsert error:', error);
}
test();
