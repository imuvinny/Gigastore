async function run() {
  const response = await fetch(`https://www.plug.tech/products.json?limit=5&page=1`, { 
    headers: { "Accept": "application/json" } 
  });
  const data = await response.json();
  console.log(data.products[0].variants[0]);
}
run();
