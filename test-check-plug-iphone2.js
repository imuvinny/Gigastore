async function run() {
  const res2 = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=USD`);
  const data2 = await res2.json();
  const iphone = data2.products.find(p => p.title.includes('iPhone 13 Pro'));
  if (iphone) {
      console.log('iPhone 13 Pro (from USD products.json):');
      for (const v of iphone.variants) console.log(v.title, v.price);
  }
}
run();
