async function run() {
  for (let i = 1; i <= 10; i++) {
    const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${i}&currency=ZMW`, {
      headers: { "Cookie": "cart_currency=ZMW" }
    });
    const data = await res.json();
    if (!data.products || data.products.length === 0) break;
    const p = data.products.find(p => p.title.includes('Pixel 10a'));
    if (p) {
      console.log(`Page: ${i}`);
      for (const v of p.variants) {
        console.log(v.title, v.price, typeof v.price);
      }
      return;
    }
  }
}
run();
