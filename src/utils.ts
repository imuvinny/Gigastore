
import { Product, VariantColor } from './types';

export const isPlugPromoImage = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const l = url.toLowerCase();
  return (
    l.includes("plug") ||
    l.includes("whats-in-the-box") ||
    l.includes("what-in-the-box") ||
    l.includes("whats_in_the_box") ||
    l.includes("android_20") ||
    l.includes("iphone_20") ||
    l.includes("macbook_20") ||
    l.includes("ipad_20") ||
    l.includes("watch_20") ||
    l.includes("apple_20") ||
    l.includes("google_20") ||
    l.includes("samsung_20") ||
    l.includes("_20_1") ||
    l.includes("starter") ||
    l.includes("giftpack") ||
    l.includes("gift-pack") ||
    l.includes("gift_pack") ||
    l.includes("gift") ||
    l.includes("casepack") ||
    l.includes("airpodspack") ||
    l.includes("devicepack") ||
    l.includes("smartcasepack") ||
    l.includes("plugpacks") ||
    l.includes("unlocked_graphic") ||
    l.includes("unlocked-graphic") ||
    l.includes("factoryunlocked") ||
    l.includes("fast-charger") ||
    l.includes("charger-bundle") ||
    l.includes("graphic_") ||
    l.includes("graphic-") ||
    l.includes("graphic.") ||
    l.includes("graphic?") ||
    l.includes("compatible_charging") ||
    l.includes("charging_cable") ||
    l.includes("template-withdevices") ||
    l.includes("withdevices") ||
    l.includes("pdf.png") ||
    l.includes("lifestyle") ||
    l.includes("model") ||
    l.includes("person") ||
    l.includes("human") ||
    l.includes("hand") ||
    l.includes("using") ||
    l.includes("box") ||
    l.includes("adapter") ||
    l.includes("charger") ||
    l.includes("cable") ||
    l.includes("accessory") ||
    l.includes("accessories") ||
    // Specific blocklist for known lifestyle/box images that don't follow the naming convention
    l.includes("142911.925") || // Pixel 6 Pro Sorta Sunny Lifestyle
    l.includes("141357.102") || // Pixel 6 Pro Black Lifestyle
    l.includes("4484a7aa-0c6d") || // Unknown lifestyle image
    l.includes("75f9a952-7bc9") || // Unknown lifestyle image
    l.includes("pixel10shopify") // Pixel 10 What's in the box
  );
};

export const parseColors = (colors: string[] | undefined): VariantColor[] => {
  if (!colors || colors.length === 0) return [];
  try {
    if (colors[0].startsWith('{')) {
      return colors.map(c => JSON.parse(c) as VariantColor);
    }
  } catch (e) {
    console.error("Failed to parse colors JSON", e);
  }
  return [];
};

export const isProductAvailable = (product: import('./types').Product): boolean => {
  const parsed = parseColors(product.colors);
  if (parsed.length === 0) return true;
  
  let available = false;
  parsed.forEach(col => {
    col.storages?.forEach(st => {
      if (st.connectivities && st.connectivities.length > 0) {
        st.connectivities.forEach(conn => {
          conn.conditions?.forEach(cond => {
            if (cond.available) available = true;
          });
        });
      } else if (st.conditions) {
        st.conditions.forEach(cond => {
          if (cond.available) available = true;
        });
      }
    });
  });
  return available;
};

export const getMinConditionPriceFromColors = (colors: string[] | undefined): number | null => {
  if (!colors || colors.length === 0) return null;
  try {
    const parsed = parseColors(colors);
    if (parsed.length === 0) return null;
    let minPrice: number | null = null;
    parsed.forEach(col => {
      col.storages?.forEach(st => {
        if (st.connectivities && st.connectivities.length > 0) {
          st.connectivities.forEach(conn => {
            conn.conditions?.forEach(cond => {
              if (cond.price != null && (minPrice === null || cond.price < minPrice)) {
                minPrice = cond.price;
              }
            });
          });
        } else if (st.conditions) {
          st.conditions.forEach(cond => {
            if (cond.price != null && (minPrice === null || cond.price < minPrice)) {
              minPrice = cond.price;
            }
          });
        }
      });
    });
    return minPrice;
  } catch (e) {
    return null;
  }
};

export const getEffectiveConditionPrice = (
  product: Product,
  condPrice?: number | null,
  minVariantPrice?: number | null
): number => {
  if (condPrice == null) return product.price;

  const minPrice = minVariantPrice ?? getMinConditionPriceFromColors(product.colors);
  if (minPrice != null && minPrice > 0) {
    const delta = condPrice - minPrice;
    return Math.max(1, product.price + (delta > 0 ? delta : 0));
  }

  return product.price;
};


export const ZMW_RATE = 20;
export const MARKUP_MULTIPLIER = 1.0;

export const STANDARD_SHIPPING_FEE_ZMW = 890;
export const STARTER_PACK_SHIPPING_FEE_ZMW = 1056;
export const LAPTOP_SHIPPING_FEE_ZMW = 1055;
export const EARPOD_SHIPPING_FEE_ZMW = 602;
export const ACCESSORY_SHIPPING_FEE_ZMW = 604;
export const SHIPPING_FEE_ZMW = 890;
export const SHIPPING_FEE_USD = SHIPPING_FEE_ZMW / (ZMW_RATE * MARKUP_MULTIPLIER);

export const isLaptopProduct = (product: { name: string; brand?: string }) => {
  const n = (product.name || '').toLowerCase();
  const c = (product.brand || '').toLowerCase();
  return n.includes('macbook') || n.includes('laptop') || n.includes('pc') || c.includes('macbook') || c.includes('laptop') || c.includes('pc');
};

export const isEarpodProduct = (product: { name: string; brand?: string }) => {
  const n = (product.name || '').toLowerCase();
  const c = (product.brand || '').toLowerCase();
  return n.includes('earpod') || n.includes('earbud') || n.includes('buds') || n.includes('airpods') || n.includes('true wireless') || n.includes('powerbeats fit') || n.includes('powerbeats pro') || c.includes('earpod') || c.includes('earbud');
};

export const isStarterPackProduct = (product: { name: string; brand?: string }) => {
  const n = (product.name || '').toLowerCase();
  return n.includes('starter pack') || n.includes('starter-pack') || n.includes('gift pack') || n.includes('giftpack');
};

export interface BundleItem {
  name: string;
  quantity: number;
  subtitle?: string;
  image?: string;
}

export const getStarterPackBundleItems = (
  product: { name: string; image?: string },
  selectedColor?: string,
  selectedStorage?: string,
  selectedConditionName?: string
): BundleItem[] => {
  const name = product.name || '';
  const lower = name.toLowerCase();

  if (!isStarterPackProduct(product)) {
    return [];
  }

  // Extract clean device title
  let deviceBase = name
    .replace(/\s*-\s*starter pack/gi, '')
    .replace(/\s*-\s*gift pack/gi, '')
    .replace(/\s*starter pack/gi, '')
    .replace(/\s*gift pack/gi, '')
    .trim();

  // Cable type heuristic based on model
  const isLightning = lower.includes('iphone 11') || lower.includes('iphone 12') || lower.includes('iphone 13') || lower.includes('iphone 14') || lower.includes('ipad 7') || lower.includes('ipad 8') || lower.includes('ipad 9');
  const cableSubtitle = isLightning ? 'Lightning / 3FT' : 'Type-C / 1M';

  const colorStr = selectedColor && selectedColor !== 'Default' ? ` ${selectedColor}` : '';
  const storageStr = selectedStorage && selectedStorage !== 'N/A' ? ` ${selectedStorage}` : '';
  const conditionStr = selectedConditionName ? ` (${selectedConditionName})` : '';

  return [
    {
      name: '1 × Fast Charger Bundle - Type C Adapter + Charging Cable (1M)',
      quantity: 1,
      subtitle: cableSubtitle,
      image: '/bundle-charger.svg'
    },
    {
      name: `1 × Plug - Preinstalled Tempered Glass Screen Protector for ${deviceBase}`,
      quantity: 1,
      subtitle: 'Scratch-Resistant 9H Glass',
      image: '/bundle-glass.svg'
    },
    {
      name: `1 × Plug - Hard Shell Clear Case for ${deviceBase}`,
      quantity: 1,
      subtitle: 'Shock-Absorbing Protection',
      image: '/bundle-case.svg'
    },
    {
      name: `1 × ${deviceBase}${colorStr}${storageStr} (Unlocked)`,
      quantity: 1,
      subtitle: selectedConditionName || 'Good / Unlocked',
      image: product.image
    }
  ];
};

export const isTestProduct = (product: { name: string; brand?: string; price?: number; finalPrice?: number }) => {
  const n = (product.name || '').toLowerCase();
  return (
    n.includes('apple earpods (3.5mm)') ||
    n.includes('earpods (3.5mm)') ||
    n.includes('test') ||
    (product.price !== undefined && product.price <= 1) ||
    (product.finalPrice !== undefined && product.finalPrice <= 1)
  );
};

export const isAccessoryItem = (product: { name: string; brand?: string }) => {
  const n = (product.name || '').toLowerCase();
  const c = (product.brand || '').toLowerCase();
  return c.includes('accessories') || n.includes('accessory') || n.includes('case') || 
         n.includes('protector') || n.includes('screen') || n.includes('keyboard') || 
         n.includes('mouse') || n.includes('cover') || n.includes('cable') || 
         n.includes('charger') || n.includes('adapter');
};

export const calculateShippingFeeZMW = (cart: Array<{ name: string; brand?: string; price?: number; finalPrice?: number; quantity?: number }>) => {
  if (!cart || cart.length === 0) return 0;
  const nonTestCart = cart.filter(item => !isTestProduct(item));
  if (nonTestCart.length === 0) return 0;

  let baseFee = STANDARD_SHIPPING_FEE_ZMW;
  if (nonTestCart.some(isStarterPackProduct)) baseFee = STARTER_PACK_SHIPPING_FEE_ZMW;
  else if (nonTestCart.some(isLaptopProduct)) baseFee = LAPTOP_SHIPPING_FEE_ZMW;
  else if (nonTestCart.some(item => !isEarpodProduct(item) && !isAccessoryItem(item))) baseFee = STANDARD_SHIPPING_FEE_ZMW;
  else if (nonTestCart.some(isAccessoryItem)) baseFee = ACCESSORY_SHIPPING_FEE_ZMW;
  else if (nonTestCart.some(isEarpodProduct)) baseFee = EARPOD_SHIPPING_FEE_ZMW;

  const totalQuantity = nonTestCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  if (totalQuantity <= 1) {
    return baseFee;
  }
  
  return baseFee + ((totalQuantity - 1) * 300);
}; 

export const calculateBaseZMW = (usdPrice: number) => {
  return Math.round(usdPrice); // Already ZMW!
};

export const getDisplayPriceUSD = (price: number) => { return calculateBaseZMW(price); };

export const formatZMW = (usdPrice: number) => {
  // Wait, if it's already ZMW...
  return 'K' + Math.round(usdPrice).toLocaleString('en-US');
};

export const formatRawZMW = (zmwPrice: number) => {
  return 'K' + Math.round(zmwPrice).toLocaleString('en-US');
};

export const getProfitMarginZMW = (product: { name: string; brand?: string; manualMarginZMW?: number | null; price?: number; finalPrice?: number }) => {
  if (product.manualMarginZMW !== undefined && product.manualMarginZMW !== null) {
    return Number(product.manualMarginZMW);
  }
  
  const n = (product.name || '').toLowerCase();
  
  // Specific override for test product
  if (n.includes('earpods (3.5mm)')) {
    return 0;
  }
  
  const c = (product.brand || '').toLowerCase();
  
  // Strict formula for Accessories
  if (c === 'accessories' || n.includes('accessory')) {
    let rawPrice = product.price;
    if (rawPrice === undefined && product.finalPrice !== undefined) {
      // Approximate raw price from final price for stats
      if (product.finalPrice < 200) rawPrice = product.finalPrice - 50;
      else if (product.finalPrice < 400) rawPrice = product.finalPrice - 100;
      else if (product.finalPrice < 650) rawPrice = product.finalPrice - 150;
      else if (product.finalPrice < 1150) rawPrice = product.finalPrice - 250;
      else rawPrice = product.finalPrice - 400;
    }
    const price = rawPrice || 0;
    
    if (price < 150) return 50;
    if (price >= 150 && price < 300) return 100;
    if (price >= 300 && price < 500) return 150;
    if (price >= 500 && price < 900) return 250;
    if (price >= 900 && price < 1000) return 250;
    return 400; // >= 1000
  }
  
  // 1. Macbooks / Laptops -> +2000
  if (n.includes('macbook') || n.includes('laptop') || n.includes('pc') || c.includes('macbook') || c.includes('laptop')) {
    return 2000;
  }
  
  // 2. Tablets / iPads -> +500
  if (n.includes('ipad') || n.includes('tablet') || n.includes('galaxy tab') || c.includes('ipad') || c.includes('tablet')) {
    return 500;
  }
  
  // 3. Speakers (JBL etc.) -> +400
  if (n.includes('speaker') || n.includes('pill') || n.includes('flip') || c.includes('speaker')) {
    return 400;
  }

  // 4. Watches -> +300
  if (n.includes('watch') || c.includes('watch')) {
    return 300;
  }

  // 5. Earpods / Earbuds -> +100
  const isEarbudOrEarpod = n.includes('earpod') || n.includes('earbud') || n.includes('buds') || n.includes('airpods') || n.includes('true wireless') || n.includes('powerbeats fit') || n.includes('powerbeats pro') || c.includes('earpod') || c.includes('earbud');
  if (isEarbudOrEarpod) {
    return 100;
  }

  // 6. Headphones -> +200
  const isHeadphone = n.includes('headphone') || n.includes('beats solo') || n.includes('tune 670nc') || n.includes('tune 770nc') || n.includes('wi-c100') || c.includes('headphone');
  if (isHeadphone) {
    return 200;
  }
  
  // 7. Phones (Google phone, iPhones, Android phones, Samsung, etc.) -> +600
  const isPhone = n.includes('iphone') || n.includes('pixel') || (n.includes('galaxy') && !n.includes('bud') && !n.includes('watch') && !n.includes('tab')) || n.includes('android') || /\bphone(s)?\b/i.test(n) || (/\bphone(s)?\b/i.test(c) && !c.includes('headphone'));
  if (isPhone) {
    return 600;
  }
  
  // Default accessories / other
  return 100;
};

export const getProductPriceZMW = (product: Product, baseZmwPrice: number) => {
  return Math.round(baseZmwPrice); // The db basePrice is already the final ZMW price!
};

export const formatProductZMW = (product: Product, baseZmwPrice: number) => {
  return formatRawZMW(getProductPriceZMW(product, baseZmwPrice));
};

export const getCrossedOutPriceZMW = (product: Product, baseZmwPrice: number) => {
  const currentZMW = getProductPriceZMW(product, baseZmwPrice);
  // To make it look like a good deal, let's make the crossed out price roughly 1.45 to 1.6 times the current price
  // We can use a deterministic multiplier based on the product name length or ID so it stays consistent
  const multiplier = 1.35 + (((product.name.length % 10) / 10) * 0.3); // between 1.35x and 1.65x
  return Math.round(currentZMW * multiplier);
};

export const formatCrossedOutZMW = (product: Product, baseZmwPrice: number) => {
  return formatRawZMW(getCrossedOutPriceZMW(product, baseZmwPrice));
};

export const getSavePercentage = (product: Product, baseZmwPrice: number) => {
  const currentZMW = getProductPriceZMW(product, baseZmwPrice);
  const crossedOut = getCrossedOutPriceZMW(product, baseZmwPrice);
  const savings = crossedOut - currentZMW;
  return Math.round((savings / crossedOut) * 100);
};

export const getOrderFinalZMW = (order: { product_name: string; quantity?: number; total_price: number | string }) => {
  const rawTotal = Number(order.total_price);
  if (isNaN(rawTotal)) return 0;

  if (rawTotal >= 1000 || (order.product_name && order.product_name.toLowerCase().includes('earpods (3.5mm)'))) {
    return Math.round(rawTotal);
  }

  const qty = Number(order.quantity) || 1;
  const unitUsd = rawTotal / qty;
  const unitBaseZMW = Math.ceil(unitUsd * ZMW_RATE);

  const fakeProd: Product = {
    id: 'temp',
    name: order.product_name || '',
    brand: order.product_name || '',
    price: unitUsd,
    image: '',
    description: '',
    colors: [],
    accentColor: ''
  };

  const unitFinalZMW = getProductPriceZMW(fakeProd, unitBaseZMW);
  return Math.round(unitFinalZMW * qty);
};

export const getOrderProfitZMW = (order: { product_name: string; quantity?: number; total_price: number | string }) => {
  const pName = order.product_name || '';
  const qty = Number(order.quantity) || 1;
  const rawTotal = Number(order.total_price);
  const finalPrice = isNaN(rawTotal) ? 0 : rawTotal / qty;
  // If it's an accessory, we want it to trigger the accessory logic by checking the name or if it has accessory keywords
  const isAccessory = pName.toLowerCase().includes('accessory') || pName.toLowerCase().includes('case') || pName.toLowerCase().includes('charger') || pName.toLowerCase().includes('protector');
  const margin = getProfitMarginZMW({ 
    name: pName, 
    brand: isAccessory ? 'accessories' : '', 
    finalPrice 
  });
  return Math.round(margin * qty);
};
