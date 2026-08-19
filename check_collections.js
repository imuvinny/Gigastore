async function run() {
  const collections = [
    "apple-iphones",
    "apple-watches",
    "apple-ipads",
    "macbooks",
    "airpods",
    "headphones",
    "androids"
  ];
  for (const c of collections) {
    const r = await fetch(`https://www.plug.tech/collections/${c}/products.json?limit=250`);
    if(r.ok) {
      const d = await r.json();
      console.log(c, d.products.length);
    }
  }
}
run();
