const getProfitMarginZMW = (p) => {
  const n = (p.name || '').toLowerCase();
  const c = (p.brand || '').toLowerCase();
  
  if (c === 'accessories') {
    const price = p.price || 0;
    if (price < 150) return 50;
    if (price >= 150 && price < 300) return 100;
    if (price >= 300 && price < 500) return 150;
    if (price >= 500 && price < 900) return 250;
    if (price >= 900 && price < 1000) return 250;
    return 400; 
  }
  if (n.includes('macbook') || n.includes('laptop') || n.includes('pc') || c.includes('macbook') || c.includes('laptop')) return 2000;
  if (n.includes('ipad') || n.includes('tablet') || n.includes('galaxy tab') || c.includes('ipad') || c.includes('tablet')) return 500;
  if (n.includes('speaker') || n.includes('pill') || n.includes('flip') || c.includes('speaker')) return 400;
  if (n.includes('watch') || c.includes('watch')) return 300;
  const isEarbudOrEarpod = n.includes('earpod') || n.includes('earbud') || n.includes('buds') || n.includes('airpods') || n.includes('true wireless') || n.includes('powerbeats fit') || n.includes('powerbeats pro') || c.includes('earpod') || c.includes('earbud');
  if (isEarbudOrEarpod) return 100;
  const isHeadphone = n.includes('headphone') || n.includes('beats solo') || n.includes('tune 670nc') || n.includes('tune 770nc') || n.includes('wi-c100') || c.includes('headphone');
  if (isHeadphone) return 200;
  const isPhone = n.includes('iphone') || n.includes('pixel') || (n.includes('galaxy') && !n.includes('bud') && !n.includes('watch') && !n.includes('tab')) || n.includes('android') || /\bphone(s)?\b/i.test(n) || (/\bphone(s)?\b/i.test(c) && !c.includes('headphone'));
  if (isPhone) return 600;
  return 100;
};

console.log(getProfitMarginZMW({ name: 'iPhone 13 Pro (Unlocked)', brand: 'Apple Phones' }));
