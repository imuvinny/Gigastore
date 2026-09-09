async function run() {
  const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
  // I need to loop through pages to find Pixel 8a
  let page = 1;
  while(true) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
    const data = await response.json();
    if(!data.products || data.products.length === 0) break;
    for(const p of data.products) {
       if (p.title.includes('Google Pixel 8a Bay')) {
           console.log('Pixel 8a Found:', p.variants.map(v => ({title: v.title, price: v.price, available: v.available})));
       }
       if (p.title.includes('Google Pixel 10a Obsidian')) {
           console.log('Pixel 10a Found:', p.variants.map(v => ({title: v.title, price: v.price, available: v.available})));
       }
       if (p.title.includes('Google Pixel 9 Obsidian')) {
           console.log('Pixel 9 Found:', p.variants.map(v => ({title: v.title, price: v.price, available: v.available})));
       }
    }
    page++;
  }
}
run();
