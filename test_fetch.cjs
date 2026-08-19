const fs = require('fs');
fetch('https://www.plug.tech/collections/apple-ipads/products.json?limit=1')
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync('plug_test.json', JSON.stringify(data.products[0], null, 2));
    console.log("Written plug_test.json");
  });
