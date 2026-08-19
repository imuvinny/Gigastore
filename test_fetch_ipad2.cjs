const fs = require('fs');
fetch('https://www.plug.tech/collections/apple-ipads/products.json?limit=250')
  .then(res => res.json())
  .then(data => {
    const ipad = data.products.find(p => p.title.includes('iPad 10.9') && p.title.includes('64GB') && p.title.includes('Silver'));
    if(ipad) {
        fs.writeFileSync('plug_test_ipad2.json', JSON.stringify(ipad, null, 2));
        console.log("Written plug_test_ipad2.json");
    } else {
        console.log("Not found");
    }
  });
