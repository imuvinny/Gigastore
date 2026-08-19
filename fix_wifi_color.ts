import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

function extractColorFromName(name: string): string {
    // iPad Air 10.9" (4th Gen, 2020) 64GB - Sky Blue (Wi-Fi)
    const dashMatch = name.match(/-\s*([^(]+)/);
    if (dashMatch) {
        return dashMatch[1].trim();
    }
    return 'Default';
}

function colorToHex(c: string) {
    if (!c) return '#cccccc';
    c = c.toLowerCase();
    if (c.includes('black') || c.includes('midnight') || c.includes('space') || c.includes('obsidian')) return '#222222';
    if (c.includes('white') || c.includes('starlight') || c.includes('silver') || c.includes('snow')) return '#f5f5f7';
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
}

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  let updatedCount = 0;
  for (const p of products || []) {
      const colors = typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors;
      const parsedColors = colors.map((c: any) => typeof c === 'string' ? JSON.parse(c) : c);
      
      let changed = false;
      for (const colorObj of parsedColors) {
          if (colorObj.name.toLowerCase().includes('wi-fi') || colorObj.name === 'Default') {
             const realColor = extractColorFromName(p.name);
             if (realColor && realColor !== 'Default') {
                 colorObj.name = realColor;
                 colorObj.hex = colorToHex(realColor);
                 changed = true;
             }
          }
      }
      
      if (changed) {
          const newColors = parsedColors.map((c: any) => JSON.stringify(c));
          await supabase.from('products').update({ colors: newColors }).eq('id', p.id);
          console.log(`Updated ${p.name} -> colors: ${parsedColors.map((c: any) => c.name).join(', ')}`);
          updatedCount++;
      }
  }
  console.log(`Updated ${updatedCount} products.`);
}
run();
