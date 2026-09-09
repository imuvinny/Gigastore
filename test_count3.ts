async function test() {
  let page = 1;
  let count = 0;
  while(true) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        console.log('Page', page, 'items:', data.products?.length);
        count += data.products?.length || 0;
        if (!data.products || data.products.length < 250) break;
        page++;
    } catch(e) {
        console.log('Failed to parse on page', page);
        break;
    }
  }
  console.log('Total:', count);
}
test();
