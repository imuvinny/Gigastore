async function run() {
  const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`, {
    headers: { "Cookie": "cart_currency=ZMW" }
  });
  const data = await res.json();
  const p = data.products.find(p => p.title.includes('Pixel 10a'));
  if (p) {
    for (const v of p.variants) {
      console.log(v.title, v.price);
    }
  } else {
    console.log('not on page 1');
  }
}
run();
