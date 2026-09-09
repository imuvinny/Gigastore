async function run() {
  const res = await fetch(`https://www.plug.tech/products/google-pixel-9-obsidian-128gb-unlocked.js`, { headers: { "Cookie": "cart_currency=ZMW" }});
  if (res.ok) {
     const data = await res.json();
     console.log('Pixel 9 (ZMW):');
     for (const v of data.variants) console.log(v.title, v.price);
  }
  const res2 = await fetch(`https://www.plug.tech/products/google-pixel-10a-obsidian-128gb-unlocked.js`, { headers: { "Cookie": "cart_currency=ZMW" }});
  if (res2.ok) {
     const data2 = await res2.json();
     console.log('Pixel 10a (ZMW):');
     for (const v of data2.variants) console.log(v.title, v.price);
  }
}
run();
