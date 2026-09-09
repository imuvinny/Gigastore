async function run() {
  const res = await fetch(`https://www.plug.tech/products/google-pixel-10a-obsidian-128gb-unlocked.js`, {
    headers: { "Cookie": "cart_currency=ZMW" }
  });
  const data = await res.json();
  for (const v of data.variants) {
     console.log(v.title, v.price);
  }
}
run();
