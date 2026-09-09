async function run() {
  const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=USD`);
  const data = await res.json();
  const acc = data.products.find(p => p.title.includes('Case-Mate Prints Series Hard Case for Samsung Galaxy (S21+)'));
  if (acc) {
      console.log('Accessory:', acc.title);
      for (const v of acc.variants) console.log(v.title, v.price);
  }
}
run();
