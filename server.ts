import express from "express";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

let cachedSupabase: any = null;
function getSupabaseClient() {
  if (cachedSupabase) return cachedSupabase;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    cachedSupabase = createClient(url, key, {
      auth: { persistSession: false }
    });
    return cachedSupabase;
  }
  return null;
}

async function saveSyncLogToDb(syncLog: any) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("saveSyncLogToDb: Supabase client not initialized. Missing environment variables on Vercel.");
    return;
  }
  try {
    const { error } = await supabase.from('sync_logs').insert([{
      timestamp: syncLog.timestamp,
      status: syncLog.status,
      added_count: syncLog.addedCount,
      updated_count: syncLog.updatedCount,
      deleted_count: syncLog.deletedCount,
      added_items: syncLog.addedItems,
      updated_items: syncLog.updatedItems,
      deleted_items: syncLog.deletedItems,
      error_message: syncLog.errorMessage
    }]);
    if (error) {
      console.error("Error inserting into sync_logs table:", error.message || error);
    } else {
      console.log("Sync log successfully saved to Supabase.");
    }
  } catch (e) {
    console.error("Error saving sync log to DB:", e);
  }
}

const isPlugPromoImage = (url: string): boolean => {
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
    l.includes("pdf.png")
  );
};

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

  // Lenco Pay API Configuration & Operations
  function getLencoSecretKey(): { key: string | null; error?: string } {
    const rawKey = process.env.LENCO_SECRET_KEY;
    if (!rawKey || !rawKey.trim()) {
      return { key: null, error: "LENCO_SECRET_KEY environment variable is not configured." };
    }
    const cleanKey = rawKey.trim();
    // Check if key contains non-ASCII characters (like bullet points ● or • copied from masked dashboard)
    if (/[^\x00-\x7F]/.test(cleanKey) || cleanKey.includes('●') || cleanKey.includes('•')) {
      return {
        key: null,
        error: "LENCO_SECRET_KEY contains masked bullet points (●). Please go to Lenco Dashboard -> API Keys, click the 'reveal' icon, and copy the real unmasked secret key into Settings."
      };
    }
    return { key: cleanKey };
  }

  app.get("/api/payments/lenco/config", (req, res) => {
    const { key, error } = getLencoSecretKey();
    const publicKey = process.env.LENCO_PUBLIC_KEY;
    res.json({
      configured: Boolean(key),
      keyError: error || null,
      publicKey: publicKey || ""
    });
  });

  app.post("/api/payments/lenco/mobile-money", async (req, res) => {
    const { key: secretKey, error: keyError } = getLencoSecretKey();
    if (!secretKey) {
      return res.status(400).json({
        success: false,
        error: keyError || "LENCO_SECRET_KEY is invalid."
      });
    }

    try {
      const { amount, phone, operator, reference, email, firstName, lastName } = req.body;

      if (!amount || !phone || !operator || !reference) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment fields: amount, phone, operator, or reference."
        });
      }

      // Format phone number for Zambia (260xxxxxxxx)
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "260" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("260") && formattedPhone.length === 9) {
        formattedPhone = "260" + formattedPhone;
      }

      // Map operator to lowercase format
      const normalizedOperator = operator.toLowerCase().trim();

      const lencoPayload = {
        amount: Number(amount),
        phone: formattedPhone,
        operator: normalizedOperator,
        country: "zm",
        reference: reference,
        email: email || "",
        firstName: firstName || "",
        lastName: lastName || "",
        bearer: "merchant"
      };

      console.log("Initiating Lenco Mobile Money Collection:", lencoPayload);

      const response = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(lencoPayload)
      });

      const data = await response.json();
      console.log("Lenco Mobile Money Response:", data);

      if (response.ok && (data.status === true || data.status === "pay-offline" || response.status === 200)) {
        return res.json({
          success: true,
          data: data.data || data,
          message: data.message || "Mobile money prompt initiated"
        });
      } else {
        let errorMsg = data.message || "Lenco payment initiation failed";
        if (typeof data.message === 'object') {
            errorMsg = JSON.stringify(data.message);
        }
        if (data.errors && Array.isArray(data.errors)) {
            errorMsg += " - " + data.errors.map(e => `${e.message || ''} (Code: ${e.errorCode || ''})`).join(', ');
        } else if (data.errorCode) {
            errorMsg += " (ErrorCode: " + data.errorCode + ")";
        }
        return res.status(response.status || 400).json({
          success: false,
          error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
          details: data
        });
      }
    } catch (err: any) {
      console.error("Lenco Mobile Money API Error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Internal server error connecting to Lenco Pay"
      });
    }
  });

  app.post("/api/payments/lenco/card", async (req, res) => {
    const { key: secretKey, error: keyError } = getLencoSecretKey();
    if (!secretKey) {
      return res.status(400).json({
        success: false,
        error: keyError || "LENCO_SECRET_KEY is invalid."
      });
    }

    try {
      const { amount, reference, email, firstName, lastName, card } = req.body;

      const lencoPayload = {
        amount: Number(amount),
        currency: "ZMW",
        reference,
        email,
        firstName,
        lastName,
        card
      };

      const response = await fetch("https://api.lenco.co/access/v2/collections/card", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(lencoPayload)
      });

      const data = await response.json();
      if (response.ok) {
        return res.json({ success: true, data: data.data || data });
      } else {
        return res.status(response.status || 400).json({
          success: false,
          error: data.message || "Lenco card collection failed",
          details: data
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Internal server error with Lenco card payment"
      });
    }
  });

  app.get("/api/payments/lenco/status/:reference", async (req, res) => {
    const { key: secretKey, error: keyError } = getLencoSecretKey();
    if (!secretKey) {
      return res.status(400).json({ success: false, error: keyError || "LENCO_SECRET_KEY not set" });
    }

    try {
      const { reference } = req.params;
      const response = await fetch(`https://api.lenco.co/access/v2/collections/status/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`
        }
      });

      const data = await response.json();
      return res.json({ success: response.ok, data: data.data || data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/payments/lenco/webhook", async (req, res) => {
    try {
      const payload = req.body;
      console.log("Lenco Webhook Received:", JSON.stringify(payload));

      const eventType = payload.event || payload.type;
      const status = payload.data?.status || payload.status;
      const reference = payload.data?.reference || payload.reference;

      const supabase = getSupabaseClient();
      if ((status === "successful" || eventType === "collection.successful") && reference && supabase) {
        // Update order status in database
        console.log(`Updating order reference ${reference} to Processing`);
        await supabase.from("orders").update({ status: "Processing" }).eq("id", reference);
      }

      return res.status(200).json({ status: "success", message: "Webhook processed" });
    } catch (err: any) {
      console.error("Error processing Lenco webhook:", err);
      return res.status(200).json({ status: "received", error: err.message });
    }
  });

  app.get("/api/sync-logs", async (req, res) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("Supabase credentials missing on server side.");
      return res.json({ 
        success: true, 
        logs: [], 
        warning: "Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY or SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) are missing in Vercel settings." 
      });
    }
    try {
      const { data: logs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (error && error.code !== '42P01') {
        console.error("Supabase error fetching sync logs:", error);
        return res.status(500).json({ error: error.message, success: false });
      }
      
      const formattedLogs = (logs || []).map((l: any) => ({
        id: l.id,
        timestamp: l.timestamp,
        status: l.status,
        addedCount: l.added_count,
        updatedCount: l.updated_count,
        deletedCount: l.deleted_count,
        addedItems: l.added_items || [],
        updatedItems: l.updated_items || [],
        deletedItems: l.deleted_items || [],
        errorMessage: l.error_message
      }));
      res.json({ success: true, logs: formattedLogs });
    } catch (e: any) {
      console.error("Error fetching sync logs:", e);
      res.status(500).json({ error: e.message || 'Failed to fetch sync logs' });
    }
  });

  app.delete("/api/sync-logs", async (req, res) => {
    const supabase = getSupabaseClient();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
    try {
      await supabase.from('sync_logs').delete().gte('timestamp', '2000-01-01');
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete logs' });
    }
  });

  app.post("/api/sync", async (req, res) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ 
        error: "Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) in Vercel Environment Variables." 
      });
    }

    try {
      const collections = [
        "apple-iphones",
        "apple-watches",
        "apple-ipads",
        "macbooks",
        "airpods",
        "headphones",
        "androids",
        "accessories"
      ];
      
      let addedCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;
      const syncedProductNames = new Set();
      const addedItems: any[] = [];
      const updatedItems: any[] = [];
      let deletedItems: any[] = [];
      
      let exchangeRate = 20.05; // Fallback rate
      try {
        const erRes = await fetch('https://open.er-api.com/v6/latest/USD', {
          signal: AbortSignal.timeout(3000)
        });
        if (erRes.ok) {
           const erData = await erRes.json();
           if (erData && erData.rates && erData.rates.ZMW) {
               exchangeRate = erData.rates.ZMW;
               if (exchangeRate < 19) {
                 exchangeRate = 20.05; 
               }
           }
        }
      } catch (e) {
        console.error("Failed to fetch exchange rate", e);
      }

      const getProfitMarginZMW = (p: { name: string; brand?: string; price?: number }) => {
        const n = (p.name || '').toLowerCase();
        const c = (p.brand || '').toLowerCase();
        
        // Strict formula for Accessories
        if (c === 'accessories') {
          const price = p.price || 0;
          if (price < 150) return 50;
          if (price >= 150 && price < 300) return 100;
          if (price >= 300 && price < 500) return 150;
          if (price >= 500 && price < 900) return 250;
          if (price >= 900 && price < 1000) return 250;
          return 400; // >= 1000
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

      const colorToHex = (colorName: string) => {
        const c = (colorName || '').toLowerCase();
        if (c.includes('black') || c.includes('midnight') || c.includes('space')) return '#1a1a1a';
        if (c.includes('white') || c.includes('starlight') || c.includes('silver')) return '#f3f3f3';
        if (c.includes('red')) return '#ff3b30';
        if (c.includes('blue') || c.includes('pacific') || c.includes('sierra') || c.includes('ultramarine')) return '#215e7c';
        if (c.includes('green') || c.includes('alpine') || c.includes('mint') || c.includes('teal')) return '#a3e4d7';
        if (c.includes('pink') || c.includes('rose')) return '#f5b7b1';
        if (c.includes('yellow')) return '#f9e79f';
        if (c.includes('purple')) return '#4b2e5c';
        if (c.includes('gold')) return '#ffd700';
        if (c.includes('graphite')) return '#4a4a4a';
        if (c.includes('titanium')) return '#878681';
        return '#cccccc';
      };

      // 1. Fetch all existing products from Supabase in ONE query
      const { data: existingProductsData, error: fetchExistingErr } = await supabase.from('products').select('id, name, brand, image');
      if (fetchExistingErr) {
        console.error("Error fetching existing products:", fetchExistingErr.message);
      }
      const existingProductMap = new Map<string, string>(
        (existingProductsData || []).map((p: any) => [String(p.name), String(p.id)])
      );

      // 2. Parallel fetch of all collections from plug.tech
      const collectionFetches = collections.map(async (collection) => {
        try {
          console.log(`Fetching from collection: ${collection}`);
          const response = await fetch(`https://www.plug.tech/collections/${collection}/products.json?limit=250&currency=ZMW`, { 
            headers: { 
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", 
              "Accept": "application/json",
              "Cookie": "cart_currency=ZMW"
            },
            signal: AbortSignal.timeout(6000)
          });

          if (!response.ok) {
            console.error(`Failed to fetch ${collection}: ${response.statusText}`);
            return { collection, products: [] };
          }
          const data = await response.json();
          return { collection, products: data.products || [] };
        } catch (err) {
          console.error(`Error fetching collection ${collection}:`, err);
          return { collection, products: [] };
        }
      });

      const fetchedCollections = await Promise.all(collectionFetches);

      const toDeleteIdsSet = new Set<string>();
      const toInsertList: any[] = [];
      const toUpdateList: any[] = [];

      for (const { collection, products } of fetchedCollections) {
        for (const item of products) {
          let name = item.title;
          if (name) {
            name = name.replace(/plug\s*-\s*/i, '');
            name = name.replace(/\bplug\b/ig, '').trim();
          }

          const lowerName = name.toLowerCase();
          if (lowerName.includes('airpods max') || lowerName.includes('sleeve') || lowerName.includes('backpack')) {
            if (existingProductMap.has(name)) {
              toDeleteIdsSet.add(existingProductMap.get(name)!);
            }
            continue;
          }

          const rawAllImages = (item.images || []).map((img: any) => typeof img === 'string' ? img : img.src).filter(Boolean);
          const cleanItemImages = rawAllImages.filter((src: string) => !isPlugPromoImage(src));
          const image = cleanItemImages.length > 0 ? cleanItemImages[0] : '';
          const description = (item.body_html || item.description || '').replace(/(<([^>]+)?>)/gi, "");
          
          const brandMap: Record<string, string> = {
            "apple-iphones": "Apple Phones",
            "apple-watches": "Apple Watches",
            "apple-ipads": "iPads",
            "macbooks": "MacBooks",
            "airpods": "AirPods",
            "headphones": "Headphones",
            "androids": "Samsung Phones",
            "accessories": "Accessories"
          };
          let brand = brandMap[collection] || 'Other';
          if (collection === 'androids') {
            if (item.vendor === 'Google' || name.includes('Pixel')) {
              brand = 'Google Phones';
            } else if (item.vendor === 'Samsung' || name.includes('Galaxy')) {
              brand = 'Samsung Phones';
            } else {
              brand = 'Android Phones';
            }
          } else if (collection === 'headphones' || collection === 'airpods') {
            const t = name.toLowerCase();
            if (t.includes('speaker') || t.includes('pill') || item.vendor === 'JBL') {
              brand = 'Speakers';
            } else if (item.vendor === 'Beats') {
              brand = 'Headphones';
            }
          }
          const accentColor = '#3ecf8e';

          const availableVariants = (item.variants || []).filter((v: any) => v.available !== false);
          if (availableVariants.length === 0 && item.variants && item.variants.length > 0) {
            if (existingProductMap.has(name)) {
              toDeleteIdsSet.add(existingProductMap.get(name)!);
            }
            continue;
          }

          const colorOptionsMap = new Map();
          let basePrice = Infinity;

          if (item.variants) {
            item.variants.forEach((v: any) => {
              let rawPlugZmw = typeof v.price === 'number' ? (v.price > 100000 ? v.price / 100 : v.price) : parseFloat(v.price);
              const margin = getProfitMarginZMW({ name: name, brand, price: rawPlugZmw });
              let vPrice = Math.round(rawPlugZmw) + margin;
              if (vPrice < basePrice) basePrice = vPrice;
              
              let color = null;
              let storage = null;
              let connectivity = null;
              let condition = null;
              
              const opts = (v.title || '').split(' / ').map(s => s.trim());
              opts.forEach(opt => {
                if (['Good', 'Great', 'Excellent', 'Flawless'].includes(opt)) condition = opt;
                else if (opt.includes('GB') || opt.includes('TB')) storage = opt;
                else if (opt.toLowerCase().includes('wifi') || opt.toLowerCase().includes('wi-fi') || opt.toLowerCase().includes('cellular') || opt.toLowerCase().includes('unlocked') || opt.toLowerCase().includes('verizon') || opt.toLowerCase().includes('t-mobile') || opt.toLowerCase().includes('at&t')) connectivity = opt;
                else if (opt !== 'Default Title') color = opt;
              });
              
              if (!color) color = "Default";
              if (!storage) storage = "128GB";
              if (!condition) condition = "Great";
              
              if (!colorOptionsMap.has(color)) {
                let imgUrl = image;
                const colorLower = color.toLowerCase().replace(/[^a-z0-9]/g, '');
                const rawItemImages = (item.images || []).map((img: any) => typeof img === 'string' ? img : img.src).filter(Boolean);
                const availableItemImages = rawItemImages.filter((src: string) => !isPlugPromoImage(src));
                
                let colorImages = availableItemImages.filter((src: string) => {
                    const s = src.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return s.includes(colorLower);
                });
                if (colorImages.length === 0) {
                    colorImages = availableItemImages;
                }
                
                if (item.images) {
                  const matchedImg = item.images.find((img: any) => {
                      const src = typeof img === 'string' ? img : img.src;
                      return src && !isPlugPromoImage(src) && src.toLowerCase().replace(/[^a-z0-9]/g, '').includes(colorLower);
                  });
                  if (matchedImg) imgUrl = typeof matchedImg === 'string' ? matchedImg : matchedImg.src;
                }
                if (isPlugPromoImage(imgUrl)) {
                  imgUrl = availableItemImages[0] || '';
                }
                
                colorImages = colorImages.filter((src: string) => !isPlugPromoImage(src));

                if (imgUrl && !isPlugPromoImage(imgUrl)) {
                  if (colorImages.includes(imgUrl)) {
                    colorImages = [imgUrl, ...colorImages.filter((s: string) => s !== imgUrl)];
                  } else {
                    colorImages = [imgUrl, ...colorImages];
                  }
                }
                
                colorOptionsMap.set(color, {
                  name: color,
                  hex: colorToHex(color),
                  image: isPlugPromoImage(imgUrl) ? '' : imgUrl,
                  images: colorImages,
                  storagesMap: new Map()
                });
              }
              
              const cData = colorOptionsMap.get(color);
              if (!cData.storagesMap.has(storage)) {
                cData.storagesMap.set(storage, {
                    name: storage,
                    connectivitiesMap: new Map(),
                    conditionsMap: new Map()
                });
              }
              
              const sData = cData.storagesMap.get(storage);
              if (connectivity) {
                  if (!sData.connectivitiesMap.has(connectivity)) {
                      sData.connectivitiesMap.set(connectivity, new Map());
                  }
                  const connData = sData.connectivitiesMap.get(connectivity);
                  connData.set(condition, {
                      name: condition,
                      price: vPrice,
                      available: v.available
                  });
              } else {
                  sData.conditionsMap.set(condition, {
                      name: condition,
                      price: vPrice,
                      available: v.available
                  });
              }
            });
          }

          if (basePrice === Infinity) basePrice = 0;

          const colorsArray = Array.from(colorOptionsMap.values()).map((c: any) => ({
            name: c.name,
            hex: c.hex,
            image: c.image,
            images: c.images && c.images.length > 0 ? c.images : [c.image],
            storages: Array.from(c.storagesMap.values()).map((sData: any) => ({
              name: sData.name,
              connectivities: sData.connectivitiesMap.size > 0 ? Array.from(sData.connectivitiesMap.entries()).map(([cName, condMap]) => ({
                 name: cName,
                 conditions: Array.from(condMap.values())
              })) : undefined,
              conditions: sData.conditionsMap.size > 0 ? Array.from(sData.conditionsMap.values()) : undefined
            }))
          })).map(obj => JSON.stringify(obj));

          if (colorsArray.length === 0) {
            colorsArray.push('#000000', '#ffffff', '#ff0000');
          }
          
          syncedProductNames.add(name);
          
          const newProductData = {
            name,
            brand,
            price: basePrice,
            image,
            description,
            colors: colorsArray,
            accentColor
          };

          const existingId = existingProductMap.get(name);
          if (!existingId) {
            toInsertList.push(newProductData);
            addedCount++;
            addedItems.push({ name, brand, price: basePrice, image });
          } else {
            toUpdateList.push({ ...newProductData, id: existingId });
            updatedCount++;
            updatedItems.push({ name, brand, price: basePrice, image });
          }
        }
      }

      // Execute batch operations
      if (toDeleteIdsSet.size > 0) {
        const idsToDelete = Array.from(toDeleteIdsSet);
        const { error: delErr } = await supabase.from('products').delete().in('id', idsToDelete);
        if (!delErr) deletedCount += idsToDelete.length;
      }

      if (toInsertList.length > 0) {
        for (let i = 0; i < toInsertList.length; i += 50) {
          const chunk = toInsertList.slice(i, i + 50);
          const { error: insErr } = await supabase.from('products').insert(chunk);
          if (insErr) console.error("Batch insert error:", insErr.message);
        }
      }

      if (toUpdateList.length > 0) {
        for (let i = 0; i < toUpdateList.length; i += 50) {
          const chunk = toUpdateList.slice(i, i + 50);
          const { error: upsertErr } = await supabase.from('products').upsert(chunk);
          if (upsertErr) console.error("Batch upsert error:", upsertErr.message);
        }
      }

      // Clean up products no longer listed in active sync
      if (existingProductsData && syncedProductNames.size > 10) {
        const staleProducts = existingProductsData.filter((p: any) => !syncedProductNames.has(p.name) && !toDeleteIdsSet.has(p.id));
        if (staleProducts.length > 0) {
          const staleIds = staleProducts.map((p: any) => p.id);
          deletedItems = staleProducts.map((p: any) => ({ name: p.name, brand: p.brand || '', image: p.image || '' }));
          const { error: delErr } = await supabase.from('products').delete().in('id', staleIds);
          if (!delErr) {
            deletedCount += staleIds.length;
          } else {
            console.error("Error deleting stale products:", delErr.message);
          }
        }
      }

      const syncLog = {
        id: `sync_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'success',
        addedCount,
        updatedCount,
        deletedCount,
        addedItems,
        updatedItems: updatedItems.slice(0, 100),
        deletedItems
      };
      await saveSyncLogToDb(syncLog);
      
      res.json({ 
        success: true, 
        addedCount, 
        updatedCount, 
        deletedCount, 
        addedItems, 
        updatedItems, 
        deletedItems, 
        syncLog 
      });
    } catch (error: any) {
      console.error('Error during sync:', error);
      const failedLog = {
        id: `sync_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'failed',
        addedCount: 0,
        updatedCount: 0,
        deletedCount: 0,
        addedItems: [],
        updatedItems: [],
        deletedItems: [],
        errorMessage: error.message || 'Sync failed'
      };
      await saveSyncLogToDb(failedLog);
      res.status(500).json({ error: 'Sync failed', syncLog: failedLog });
    }
  });

  async function startServer() {
    // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
