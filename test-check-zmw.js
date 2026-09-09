async function run() {
  for (let i=1; i<=10; i++) {
     const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${i}&currency=ZMW`, { headers: { "Cookie": "cart_currency=ZMW" }});
     const data = await res.json();
     if (!data.products) break;
     for (const p of data.products) {
        if (p.title.includes('Pixel 9 Obsidian 128GB (Unlocked)') || p.title.includes('Pixel 10a Obsidian 128GB (Unlocked)')) {
            console.log(p.title);
            for (const v of p.variants) console.log(v.title, v.price, typeof v.price);
        }
     }
  }
}
run();
