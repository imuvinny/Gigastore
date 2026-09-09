async function run() {
  const res = await fetch(`https://www.plug.tech/products/apple-macbook-air-m2-13-inch-512gb-8gb-ram-8-core-cpu-10-core-gpu-mid-2022-starlight.js`);
  const data = await res.json();
  console.log('MacBook:', data.title);
  for (const v of data.variants) console.log(v.title, v.price / 100);
}
run();
