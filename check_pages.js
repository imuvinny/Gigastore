async function test() {
  const response = await fetch("https://www.plug.tech/collections/apple-iphones/products.json?limit=250&page=1");
  const data = await response.json();
  console.log("Page 1 products:", data.products.length);
  
  const response2 = await fetch("https://www.plug.tech/collections/apple-iphones/products.json?limit=250&page=2");
  const data2 = await response2.json();
  console.log("Page 2 products:", data2.products.length);
}
test();
