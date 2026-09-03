
async function run() {
  const res = await fetch('https://www.plug.tech/products.json?limit=1');
  const data = await res.json();
  console.log(Object.keys(data.products[0].variants[0]));
}
run();

