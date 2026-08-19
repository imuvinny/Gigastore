async function test() {
  try {
    const response = await fetch('https://www.plug.tech/collections/apple-iphones/products.json');
    console.log(response.status);
    const data = await response.text();
    console.log(data.substring(0, 100));
  } catch(e) {
    console.error(e);
  }
}
test();
