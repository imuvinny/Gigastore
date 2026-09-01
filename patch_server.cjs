const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const collections = \[[\s\S]*?\];\s*let addedCount = 0;[\s\S]*?for \(const collection of collections\) {[\s\S]*?const response = await fetch\(`https:\/\/www\.plug\.tech\/collections\/\$\{collection\}\/products\.json\?limit=250&currency=ZMW`, \{/g;

const replacement = `let addedCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;
      const syncedProductNames = new Set();
      const addedItems: any[] = [];
      const updatedItems: any[] = [];
      let deletedItems: any[] = [];
      
      let exchangeRate = 20.05; // Fallback rate
      try {
        const erRes = await fetch('https://open.er-api.com/v6/latest/USD');
        if (erRes.ok) {
           const erData = await erRes.json();
           if (erData && erData.rates && erData.rates.ZMW) {
               exchangeRate = erData.rates.ZMW;
               if (exchangeRate < 19) {
                 exchangeRate = 20.05;
                }
           }
        }
      } catch (e) {
        console.error("Failed to fetch exchange rate", e);
      }
      
      const getProfitMarginZMW = (p: { name: string; brand?: string; price?: number }) => {
        const n = (p.name || '').toLowerCase();
        const c = (p.brand || '').toLowerCase();
        
        // Strict formula for Accessories
        if (c === 'accessories') {
          const price = p.price || 0;
          if (price < 150) return 50;
          if (price >= 150 && price < 300) return 100;
          if (price >= 300 && price < 500) return 150;
          if (price >= 500 && price < 900) return 250;
          if (price >= 900 && price < 1000) return 250;
          return 400; // >= 1000
        }
        if (n.includes('macbook') || n.includes('laptop') || n.includes('pc') || c.includes('macbook') || c.includes('laptop')) return 2000;
        if (n.includes('ipad') || n.includes('tablet') || n.includes('galaxy tab') || c.includes('ipad') || c.includes('tablet')) return 500;
        if (n.includes('speaker') || n.includes('pill') || n.includes('flip') || c.includes('speaker')) return 400;
        if (n.includes('watch') || c.includes('watch')) return 300;
        const isEarbudOrEarpod = n.includes('earpod') || n.includes('earbud') || n.includes('buds') || n.includes('airpods') || n.includes('true wireless') || n.includes('powerbeats fit') || n.includes('powerbeats pro') || c.includes('earpod') || c.includes('earbud');
        if (isEarbudOrEarpod) return 100;
        const isHeadphone = n.includes('headphone') || n.includes('beats solo') || n.includes('tune 670nc') || n.includes('tune 770nc') || n.includes('wi-c100') || c.includes('headphone');
        if (isHeadphone) return 200;
        const isPhone = n.includes('iphone') || n.includes('pixel') || (n.includes('galaxy') && !n.includes('bud') && !n.includes('watch') && !n.includes('tab')) || n.includes('android') || /\\bphone(s)?\\b/i.test(n) || (/\\bphone(s)?\\b/i.test(c) && !c.includes('headphone'));
        if (isPhone) return 600;
        return 100;
      };

      let page = 1;
      let hasMore = true;
      while (hasMore) {
        console.log(\`Fetching page: \${page}\`);
        const response = await fetch(\`https://www.plug.tech/products.json?limit=250&page=\${page}&currency=ZMW\`, {`;

// We also need to fix where `collections` was defined previously
const startStr = `const collections = [`;
const fetchStr = `const response = await fetch(\`https://www.plug.tech/collections/\${collection}/products.json?limit=250&currency=ZMW\`, {`;

const startIndex = code.indexOf(startStr);
const fetchIndex = code.indexOf(fetchStr);
if (startIndex !== -1 && fetchIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + code.substring(fetchIndex + fetchStr.length);
  fs.writeFileSync('server.ts', code);
  console.log("Patched fetching loop!");
} else {
  console.error("Could not find start index");
}
