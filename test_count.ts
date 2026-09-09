async function test() {
  let page = 1;
  let count = 0;
  while(true) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`);
    if (!response.ok) break;
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        count += data.products.length;
        if (data.products.length < 250) break;
        page++;
    } catch(e) {
        console.log('Failed to parse on page', page);
        break;
    }
  }
  console.log('Total:', count);
}
test();
