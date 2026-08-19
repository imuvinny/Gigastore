async function run() {
  const url = 'https://www.plug.tech/collections/macbooks/products.json?limit=250';
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxy);
  const data = await response.json();
  const contents = JSON.parse(data.contents);
  console.log('Products:', contents.products?.length);
}
run();
