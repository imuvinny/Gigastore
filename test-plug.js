async function run() {
  const res = await fetch(`https://www.plug.tech/products/google-pixel-10a-obsidian-128gb-unlocked.js`);
  if (!res.ok) {
     console.log('failed', res.status);
     return;
  }
  const data = await res.json();
  console.log(data.title);
  for (const v of data.variants) {
     console.log(v.title, v.price);
  }
}
run();
