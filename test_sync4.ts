async function test() {
  const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=1&currency=ZMW`);
  const data = await response.json();
  const products = data.products;
  const pixels = products.filter(p => p.title.includes('Google Pixel'));
  console.log('Pixels on page 1:', pixels.map(p => p.title));
}
test();
