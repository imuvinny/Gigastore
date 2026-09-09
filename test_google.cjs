async function test() {
  const r = await fetch('https://www.plug.tech/collections/androids/products.json?limit=250&currency=ZMW');
  const d = await r.json();
  const prods = d.products.filter(p => p.vendor === 'Google' || p.title.includes('Pixel'));
  prods.forEach(p => {
    console.log(p.title);
    p.variants.forEach(v => {
      console.log('  v:', v.title, v.price, v.available);
    });
  });
}
test();
