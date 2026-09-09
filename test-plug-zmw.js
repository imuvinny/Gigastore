async function run() {
  const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`, {
    headers: { "Cookie": "cart_currency=ZMW" }
  });
  const data = await res.json();
  const iphone = data.products.find(p => p.title.includes('iPhone 13 Pro (Unlocked)'));
  if (iphone) {
      console.log('iPhone 13 Pro (ZMW):');
      for (const v of iphone.variants) console.log(v.title, v.price);
  }
}
run();
