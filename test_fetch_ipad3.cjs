const fs = require('fs');
fetch('https://www.plug.tech/products/ipad-2022-10th-gen-10-9-64gb-silver-wifi-cellular.js')
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync('plug_test_ipad3.json', JSON.stringify(data, null, 2));
    console.log("Written plug_test_ipad3.json");
  }).catch(err => console.error(err));
