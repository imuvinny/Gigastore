async function run() {
  const res = await fetch(`https://www.plug.tech/products/apple-iphone-13-pro-unlocked.js`);
  if (!res.ok) return console.log('not found');
  const data = await res.json();
  console.log('iPhone 13 Pro (from js endpoint, which is USD usually):');
  for (const v of data.variants) console.log(v.title, v.price / 100);

  const res2 = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`, { headers: { "Cookie": "cart_currency=ZMW" } });
  const data2 = await res2.json();
  const iphone = data2.products.find(p => p.title.includes('iPhone 13 Pro (Unlocked)'));
  if (iphone) {
      console.log('iPhone 13 Pro (from ZMW products.json):');
      for (const v of iphone.variants) console.log(v.title, v.price);
  }
}
run();
