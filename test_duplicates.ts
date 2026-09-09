async function test() {
  let page = 1;
  const names = [];
  while(true) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        for (const p of data.products) {
            if (p.title.includes('Google Pixel 8a Bay')) names.push({page, title: p.title, variants: p.variants.map(v => v.available)});
        }
        if (!data.products || data.products.length < 250) break;
        page++;
    } catch(e) { break; }
  }
  console.log(JSON.stringify(names, null, 2));
}
test();
