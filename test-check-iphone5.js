async function run() {
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${i}&currency=USD`);
    const data = await res.json();
    const iphone = data.products.find(p => p.title === 'iPhone 13 Pro (Unlocked)' || p.title === 'Apple iPhone 13 Pro (Unlocked)');
    if (iphone) {
        console.log(iphone.title);
        for (const v of iphone.variants) {
           console.log(v.title, v.price);
        }
        break;
    }
  }
}
run();
