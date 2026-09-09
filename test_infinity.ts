async function test() {
  let page = 1;
  let count = 0;
  while(true) {
    const response = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`, { 
        headers: { 
          "User-Agent": "Mozilla/5.0", 
          "Accept": "application/json",
          "Cookie": "cart_currency=ZMW"
        } 
      });
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        for (const item of data.products) {
            const availableVariants = (item.variants || []).filter((v: any) => v.available !== false);
            if (availableVariants.length === 0) continue;
            let basePrice = Infinity;
            item.variants.forEach((v: any) => {
              let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
              let vPrice = Math.round(rawPlugZmw); 
              if (vPrice < basePrice && v.available !== false) basePrice = vPrice;
            });
            if (basePrice === Infinity || isNaN(basePrice)) {
                console.log('Found Infinity/NaN basePrice for:', item.title, item.variants);
            }
        }
        if (data.products.length < 250) break;
        page++;
    } catch(e) {
        break;
    }
  }
}
test();
