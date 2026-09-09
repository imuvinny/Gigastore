async function test() {
  let page = 1;
  let hasMore = true;
  let found9 = false;
  let found10a = false;
  let found8a = false;
  while(hasMore) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`);
    const data = await response.json();
    const products = data.products;
    for (const p of products) {
        if (p.title.includes('Google Pixel 9 Obsidian')) found9 = true;
        if (p.title.includes('Google Pixel 10a Obsidian')) found10a = true;
        if (p.title.includes('Google Pixel 8a Bay')) found8a = true;
    }
    if (products.length < 250) hasMore = false;
    else page++;
  }
  console.log({found8a, found9, found10a});
}
test();
