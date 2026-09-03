
async function run() {
  const res = await fetch('https://www.plug.tech/products.json?limit=250');
  const data = await res.json();
  const prods = data.products.filter(p => p.title.includes('iPhone 13'));
  console.log(prods.map(p => p.title));
}
run();

