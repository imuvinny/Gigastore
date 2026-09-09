async function run() {
  const res = await fetch(`https://www.plug.tech/products/apple-iphone-13-pro-unlocked.js`);
  if (res.ok) {
     const data = await res.json();
     for (const v of data.variants) console.log(v.title, v.price / 100);
     return;
  }
  
  // maybe it's under iphone-13-pro-unlocked
  const res2 = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=USD`);
  const data2 = await res2.json();
  const iphone = data2.products.find(p => p.title.includes('iPhone 13 Pro '));
  if (iphone) {
      for (const v of iphone.variants) console.log(v.title, v.price);
  }
}
run();
