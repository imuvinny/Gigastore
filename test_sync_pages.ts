async function check() {
  const allProds = [];
  for(let i=1; i<=15; i++) {
    const r = await fetch('https://www.plug.tech/products.json?limit=250&page='+i);
    const d = await r.json();
    if (d.products.length === 0) break;
    allProds.push(...d.products);
  }
  console.log(allProds.length);
}
check();
