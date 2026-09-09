async function run() {
  const res = await fetch(`https://www.plug.tech/products/google-pixel-10a-obsidian-128gb-unlocked.js`);
  const data = await res.json();
  for (const v of data.variants) {
     console.log('10a', v.title, v.price / 100);
  }

  const res2 = await fetch(`https://www.plug.tech/products/google-pixel-9-obsidian-128gb-unlocked.js`);
  const data2 = await res2.json();
  for (const v of data2.variants) {
     console.log('9', v.title, v.price / 100);
  }
}
run();
