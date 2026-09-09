async function run() {
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${i}&currency=ZMW`, {
      headers: { "Cookie": "cart_currency=ZMW" }
    });
    const data = await res.json();
    const iphone = data.products.find(p => p.title.toLowerCase().includes('apple iphone 13 pro - unlocked'));
    if (iphone) {
        console.log('iPhone 13 Pro (ZMW):');
        for (const v of iphone.variants) console.log(v.title, v.price);
        break;
    }
  }
}
run();
