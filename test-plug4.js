async function run() {
  let page = 1;
  while(true) {
    const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, {
      headers: { "Cookie": "cart_currency=ZMW" }
    });
    const data = await res.json();
    if (!data.products || data.products.length === 0) break;
    const p = data.products.find(p => p.title.includes('Pixel 10a'));
    if (p) {
      console.log(p.title);
      for (const v of p.variants) {
        console.log(v.title, v.price);
      }
      return;
    }
    page++;
  }
}
run();
