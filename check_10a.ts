async function run() {
  const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
  let page = 1;
  while(true) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { headers: { "Cookie": "cart_currency=ZMW" } });
    const data = await response.json();
    if(!data.products || data.products.length === 0) break;
    for(const p of data.products) {
       if (p.title.includes('10a')) {
           console.log('Found:', p.title);
       }
    }
    page++;
  }
}
run();
