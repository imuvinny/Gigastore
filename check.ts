
async function run() {
  const res = await fetch('https://www.plug.tech/products.json?limit=250');
  const data = await res.json();
  const item = data.products.find(p => p.title.includes('iPhone 13 Mini') && p.variants.some(v => v.available === false));
  if (item) {
    console.log(item.title);
    item.variants.slice(0,2).forEach(v => console.log(v.title, 'available:', v.available));
  } else {
    console.log('No such item found');
  }
}
run();

