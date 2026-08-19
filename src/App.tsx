import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingCart, Search, Instagram, Twitter, Facebook, Database, User, Menu, X, Sparkles } from 'lucide-react';
import { Product, CartItem, Slide } from './types';
import { products as initialProducts, initialSlides } from './data';
import { CartSidebar } from './components/CartSidebar';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { LoginModal } from './components/LoginModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { TermsModal } from './components/TermsModal';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { NetworkStatus } from './components/NetworkStatus';
import { NotFound404 } from './components/NotFound404';
import { FaXTwitter } from 'react-icons/fa6';
import { formatZMW, getDisplayPriceUSD, formatProductZMW, getMinConditionPriceFromColors, getEffectiveConditionPrice, isProductAvailable, isAccessoryItem } from './utils';



const SlideImage = ({ src }: { src: string }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <>
      {!loaded && (
        <div className="absolute bottom-4 md:bottom-0 right-0 md:pr-12 w-[90%] md:w-full h-[90%] md:h-full flex items-center justify-center pointer-events-none">
          <div className="w-full h-full bg-white/5 rounded-3xl animate-pulse" />
        </div>
      )}
      <motion.img 
        ref={imgRef}
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: loaded ? 1 : 0, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src={src}
        onLoad={() => setLoaded(true)}
        className="w-[90%] md:w-full h-[90%] md:h-full object-contain object-bottom mix-blend-lighten drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] origin-bottom md:pr-12 pb-4 md:pb-0"
      />
    </>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'default' | 'new_arrivals' | 'best_sellers'>('default');

  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategory, sortOption]);

  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [slidesList, setSlidesList] = useState<Slide[]>(initialSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [socialLinks, setSocialLinks] = useState({ instagram: '', x: '', facebook: '' });
  const [show404, setShow404] = useState(false);
  
  useEffect(() => {
    if (slidesList.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidesList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesList.length]);

  const activeColor = slidesList[activeSlide]?.color || '#ffffff';
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (productsList.length > 0 && wishlist.length > 0) {
      const validWishlist = wishlist.filter(w => {
        const product = productsList.find(p => p.id === w.id);
        return product && isProductAvailable(product);
      });
      if (validWishlist.length !== wishlist.length) {
        setWishlist(validWishlist);
      }
    }
  }, [productsList, wishlist]);

  useEffect(() => {
    async function syncWishlist() {
      if (!user || !supabase || productsList.length === 0) return;
      try {
        const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', user.id);
        
        let dbProductIds = data ? data.map(d => d.product_id) : [];
        
        // Merge with local wishlist
        const localSaved = localStorage.getItem('wishlist');
        const localWishlist: Product[] = localSaved ? JSON.parse(localSaved) : [];
        const localIds = localWishlist.map(p => p.id);
        
        const newIdsToInsert = localIds.filter(id => !dbProductIds.includes(id));
        
        if (newIdsToInsert.length > 0) {
            const inserts = newIdsToInsert.map(id => ({ user_id: user.id, product_id: id }));
            await supabase.from('wishlist').insert(inserts);
            dbProductIds = [...dbProductIds, ...newIdsToInsert];
        }

        const userWishlist = productsList.filter(p => dbProductIds.includes(p.id));
        
        const validWishlist = userWishlist.filter(p => isProductAvailable(p));
        setWishlist(validWishlist);

        // Cleanup DB if there are invalid/sold-out items
        // Only delete items that are present in productsList but unavailable.
        // Avoid deleting items completely missing from productsList as they might still be loading.
        const invalidIds = dbProductIds.filter(id => {
           const product = productsList.find(p => p.id === id);
           return product && !isProductAvailable(product);
        });
        
        if (invalidIds.length > 0) {
           for (const id of invalidIds) {
               await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', id);
           }
        }
      } catch (e) {
        console.error('Error fetching/syncing wishlist:', e);
      }
    }
    syncWishlist();
  }, [user, productsList]);

  const toggleWishlist = async (product: Product) => {
    const isWished = wishlist.some(p => p.id === product.id);
    
    setWishlist(prev => {
      if (isWished) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });

    if (user && supabase) {
      try {
        if (isWished) {
          await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id);
        } else {
          await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
        }
      } catch (e) {
        console.error('Error updating wishlist in DB', e);
      }
    }
  };
  
  const handleSocialClick = (url: string) => {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      setShow404(true);
    }
  };

  const [bestSellersCounts, setBestSellersCounts] = useState<Record<string, number>>({});
  const [latestSyncAddedNames, setLatestSyncAddedNames] = useState<Set<string>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const categories = ["Apple Phones", "Samsung Phones", "Google Phones", "Android Phones", "Apple Watches", "iPads", "MacBooks", "AirPods", "Headphones", "Speakers", "Accessories"];

  useEffect(() => {
    async function fetchSyncLogs() {
      try {
        const res = await fetch('/api/sync-logs');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
            const latest = data.logs[0];
            const names = new Set((latest.addedItems || []).map((i: any) => i.name));
            setLatestSyncAddedNames(names);
          }
        }
      } catch (e) {
        console.warn('Could not fetch sync logs:', e);
      }
    }
    fetchSyncLogs();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't trigger on initial load
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortOption]);

  let filteredProducts = productsList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.brand === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (sortOption === 'new_arrivals') {
    if (latestSyncAddedNames.size > 0) {
      filteredProducts = [...filteredProducts].sort((a, b) => {
        const aIsNew = latestSyncAddedNames.has(a.name) ? 1 : 0;
        const bIsNew = latestSyncAddedNames.has(b.name) ? 1 : 0;
        if (aIsNew !== bIsNew) return bIsNew - aIsNew;
        return 0;
      });
    } else {
      filteredProducts = [...filteredProducts].reverse();
    }
  } else if (sortOption === 'best_sellers') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const countA = bestSellersCounts[a.name] || 0;
      const countB = bestSellersCounts[b.name] || 0;
      return countB - countA;
    });
  } else {
    // Default alphabetical sorting
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Ensure accessories are always at the bottom
  filteredProducts = filteredProducts.sort((a, b) => {
    const aIsAccessory = isAccessoryItem(a) ? 1 : 0;
    const bIsAccessory = isAccessoryItem(b) ? 1 : 0;
    return aIsAccessory - bIsAccessory;
  });

  useEffect(() => {
    if (!supabase) return;
    
    const fetchProfile = async (userId: string) => {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) {
          setProfile(data);
        }
      } catch (e) {
        console.warn('Could not fetch user profile:', e);
      }
    };

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
         fetchProfile(session.user.id);
      }
    }).catch(err => {
      console.warn('Supabase auth session fetch error:', err);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
         fetchProfile(session.user.id);
      } else {
         setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    const metaName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (metaName) {
      const parts = metaName.split(' ').filter(Boolean);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    if (supabase) {
      try {
        const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
        if (!localStorage.getItem('visitor_id')) localStorage.setItem('visitor_id', visitorId);
        
        // Always attempt to log the visit. If it's a returning visitor, the DB UNIQUE constraint 
        // will safely ignore the duplicate insert. If the DB was reset, they'll be logged anew!
        Promise.resolve(supabase.from('visits').upsert([{ 
            page_path: window.location.pathname, 
            visitor_id: visitorId 
        }], { onConflict: 'visitor_id', ignoreDuplicates: true })).catch(() => {});
      } catch (e) {
        // ignore tracking error
      }
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (!supabase) { setIsLoading(false); return; }
      
      try {
        const { data: dbSettings, error: errSettings } = await supabase.from('settings').select('*').eq('key', 'social_links').single();
        if (dbSettings && dbSettings.value) {
          setSocialLinks(dbSettings.value);
        } else if (errSettings) {
          console.warn("Settings table notice:", errSettings.message || errSettings);
        }

        const { data: dbProducts, error: pError } = await supabase.from('products').select('*');
        if (pError) {
          console.warn("Products table notice:", pError.message || pError);
        } else if (dbProducts && dbProducts.length > 0) {
          setProductsList(dbProducts.filter((p: any) => !p.name.toLowerCase().includes('airpods max')));
        }

        const { data: dbOrders } = await supabase.from('orders').select('product_name, quantity').neq('status', 'pending');
        if (dbOrders) {
          const counts: Record<string, number> = {};
          dbOrders.forEach(o => {
            counts[o.product_name] = (counts[o.product_name] || 0) + (o.quantity || 1);
          });
          setBestSellersCounts(counts);
        }

        const { data: dbSlides, error: sError } = await supabase.from('slides').select('*').order('id');
        if (sError) {
          console.warn("Slides table notice:", sError.message || sError);
        } else if (dbSlides && dbSlides.length > 0) {
          setSlidesList(dbSlides);
        }
      } catch (err) {
        console.warn("Supabase connection offline or resetting, using catalog fallback.", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Synchronize cart items whenever product prices or catalog update
  useEffect(() => {
    if (!productsList || productsList.length === 0) return;
    setCart(prevCart => {
      let changed = false;
      const updated = prevCart.map(item => {
        const match = productsList.find(p => p.id === item.id);
        if (!match) return item;
        const minVarPrice = getMinConditionPriceFromColors(match.colors);
        const rawCondPrice = item.selectedCondition?.price ?? item.finalPrice ?? item.price;
        const newEffPrice = getEffectiveConditionPrice(match, rawCondPrice, minVarPrice);
        if (item.price !== match.price || item.finalPrice !== newEffPrice) {
          changed = true;
          return {
            ...item,
            price: match.price,
            finalPrice: newEffPrice,
            selectedCondition: item.selectedCondition ? { ...item.selectedCondition, price: newEffPrice } : undefined
          };
        }
        return item;
      });
      return changed ? updated : prevCart;
    });
  }, [productsList]);

  const handleAddToCart = (
    product: Product,
    selectedColor: string,
    selectedStorage: string,
    selectedCondition: { name: string; price: number; description: string },
    finalPrice: number
  ) => {
    setCart(prev => {
      // Check if same product and variants exist
      const existing = prev.find(
        item => item.id === product.id && 
                item.selectedColor === selectedColor && 
                item.selectedStorage === selectedStorage && 
                item.selectedCondition?.name === selectedCondition.name
      );
      if (existing) {
        return prev.map(item =>
          item.cartItemId === existing.cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        ...product, 
        cartItemId: Math.random().toString(36).substr(2, 9), 
        quantity: 1, 
        selectedColor, 
        selectedStorage, 
        selectedCondition, 
        finalPrice 
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(item => item.cartItemId === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2] font-sans selection:bg-white/30">
      <NetworkStatus isLoading={isLoading} />
      {show404 && <NotFound404 onClose={() => setShow404(false)} />}
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#050505] border-b border-white/5">
      <nav className="relative flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div 
            className="relative py-2"
            
          >
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white transition-all duration-300 p-1 flex items-center justify-center w-8 h-8"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={28} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={28} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(2px)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-12 left-0 w-64 bg-[#111]/90 backdrop-blur-xl border border-[#2a2a2a] rounded-xl shadow-2xl py-4 z-50 overflow-hidden"
                >
                  <div className="px-4 pb-2 mb-2 border-b border-[#2a2a2a]">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Categories</span>
                  </div>
                  <button
                    onClick={() => { setSelectedCategory(null); setSortOption('default'); setIsMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ${selectedCategory === null && sortOption === 'default' ? 'text-white bg-white/10 font-medium' : 'text-white/70 hover:text-white hover:bg-white/5 hover:pl-5'}`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => { setSelectedCategory(category); setIsMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ${selectedCategory === category ? 'text-white bg-white/10 font-medium' : 'text-white/70 hover:text-white hover:bg-white/5 hover:pl-5'}`}
                    >
                      {category}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-2xl font-bold tracking-tighter text-white cursor-pointer" onClick={() => setSelectedCategory(null)}>GIGASTORE.</div>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold uppercase tracking-widest">
          <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCategory(null); setSortOption('default'); }} className={`transition-colors ${selectedCategory === null && sortOption === 'default' ? 'text-white' : 'text-white/50 hover:text-white'}`}>Shop</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('new_arrivals'); setSelectedCategory(null); }} className={`transition-colors ${sortOption === 'new_arrivals' ? 'text-white' : 'text-white/50 hover:text-white'}`}>New Arrivals</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setSortOption('best_sellers'); setSelectedCategory(null); }} className={`transition-colors ${sortOption === 'best_sellers' ? 'text-white' : 'text-white/50 hover:text-white'}`}>Best Sellers</a>
          {selectedCategory && (
            <span className="text-white">{selectedCategory}</span>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#3ecf8e]/50 focus:bg-white/10 transition-all w-48 lg:w-64"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/50 hover:bg-black rounded-full p-1 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
                    <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="sm:hidden relative text-white hover:text-white/80 transition-colors">
            <Search size={22} />
          </button>
          <button onClick={() => setIsCartOpen(true)} className="relative text-white hover:text-white/80 transition-colors">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => {
              if (user) {
                setIsProfileOpen(true);
              } else {
                setIsCustomerAuthOpen(true);
              }
            }}
            className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/50 bg-[#111] flex items-center justify-center text-white transition-all duration-300"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : user && getInitials() ? (
              <span className="text-xs font-bold text-white">{getInitials()}</span>
            ) : (
              <User size={18} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sm:hidden w-full px-4 mb-4 -mt-2 relative z-40 overflow-hidden"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-3 pl-12 pr-10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#3ecf8e]/50 focus:bg-white/10 transition-all shadow-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/50 hover:bg-black rounded-full p-1 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* The Main Hero Section */}
        <div className="relative w-full h-[65vh] md:h-[70vh] lg:h-[85vh] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl bg-[#050505] border border-white/5">
          <AnimatePresence>
            {slidesList[activeSlide] && (
              <motion.div 
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-12 md:p-20"
                style={{ background: `radial-gradient(circle at 70% 50%, ${activeColor}30 0%, #000000 70%)` }}
              >
                <div className="z-10 w-full md:w-1/2 relative pt-10 md:pt-0">
                  {(slidesList[activeSlide].titleLines || []).map((line, i) => (
                    <motion.h2 
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="text-5xl md:text-[80px] font-black leading-[0.9] tracking-tighter text-white uppercase"
                    >
                      {line}
                    </motion.h2>
                  ))}
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-xl md:text-2xl font-bold tracking-widest uppercase"
                    style={{ color: activeColor }}
                  >
                    {slidesList[activeSlide].accentText}
                  </motion.p>
                  {slidesList[activeSlide].specs && (
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-4 text-white/60 font-medium text-lg"
                    >
                      {slidesList[activeSlide].specs}
                    </motion.p>
                  )}
                </div>
                <div className="absolute md:right-0 bottom-0 w-full md:w-[65%] h-[60%] md:h-[95%] flex items-end justify-center md:justify-end opacity-60 md:opacity-100 pointer-events-none z-0 px-4 md:px-0">
                  <SlideImage src={slidesList[activeSlide].image} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-10 left-12 md:left-20 flex gap-4 z-20">
            {slidesList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${activeSlide === idx ? 'w-12 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
        {/* Product Grid Section */}
        {isLoading || isFiltering ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-[#0a0a0a] rounded-3xl p-4 sm:p-6 border border-white/5 flex flex-col items-center">
                <div className="w-full aspect-[4/5] bg-white/5 rounded-3xl mb-4 sm:mb-8 animate-pulse" />
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4 animate-pulse" />
                <div className="h-5 bg-white/10 rounded w-1/2 mb-8 animate-pulse" />
                <div className="h-12 bg-white/5 rounded-xl w-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5">
            <Search size={48} className="text-white/20 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-neutral-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map(product => {
               const isNewItem = latestSyncAddedNames.has(product.name);
               return (
                 <div key={product.id} className="group relative bg-[#0a0a0a] rounded-3xl p-4 sm:p-6 border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center">
                    <div onClick={() => setSelectedProduct(product)} className="w-full aspect-[4/5] bg-white rounded-3xl mb-4 sm:mb-8 p-2 flex items-center justify-center relative overflow-hidden cursor-pointer shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5">

                       <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700" style={{ background: product.accentColor }} />
                       <img src={product.image} alt={product.name} className="w-[90%] h-[90%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out relative z-10" />
                    </div>
                  <h3 onClick={() => setSelectedProduct(product)} className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 tracking-tight cursor-pointer hover:text-white/80 transition-colors line-clamp-2 min-h-[3rem] sm:min-h-0 flex items-center justify-center">{product.name}</h3>
                  <p className="text-neutral-400 font-semibold text-sm sm:text-lg mb-4 sm:mb-8">{formatProductZMW(product, getDisplayPriceUSD(product.price))}</p>
                  <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       const parsedColors = product.colors && product.colors[0]?.startsWith('{') ? product.colors.map(c => JSON.parse(c)) : [];
                       const colorName = parsedColors.length > 0 ? parsedColors[0].name : (product.colors?.[0] || '#000000');
                       const storageName = parsedColors.length > 0 ? parsedColors[0].storages[0].name : (product.storages?.[0] || '128GB');
                       
                       let selectedCond = null;
                       if (parsedColors.length > 0) {
                         selectedCond = parsedColors[0].storages[0].conditions.find(c => c.available) || parsedColors[0].storages[0].conditions[0];
                       }
                       const rawCondPrice = selectedCond ? selectedCond.price : product.price;
                       const minVarPrice = getMinConditionPriceFromColors(product.colors);
                       const effectivePrice = getEffectiveConditionPrice(product, rawCondPrice, minVarPrice);
                       const defaultCondition = {
                         name: selectedCond?.name || 'Good',
                         price: effectivePrice,
                         description: selectedCond?.description || 'Visible scratches or dents; works like new. Backed by a 1-year warranty.',
                         available: true
                       };
                       handleAddToCart(
                         product, 
                         colorName, 
                         storageName, 
                         defaultCondition, 
                         effectivePrice
                       );
                     }}
                     className="mt-auto w-full py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 bg-white/5 hover:bg-white transition-colors border border-white/10 relative overflow-hidden group/btn z-20"
                  >
                     <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity" style={{ backgroundColor: "white" }} />
                     <ShoppingCart size={18} className="transition-all text-white group-hover/btn:text-black sm:w-5 sm:h-5" />
                     <span className="text-[10px] sm:text-sm font-bold tracking-widest uppercase text-white group-hover/btn:text-black transition-colors">Add</span>
                  </button>
               </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Dark-Grey Footer */}
      <footer className="border-t border-white/10 bg-[#080808] py-16">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center justify-center text-neutral-500">
          <div className="flex flex-col md:flex-row gap-8 mb-8 text-xs font-semibold uppercase tracking-widest text-center">
             <span>Shipping Info: Takes 7-10 Days</span>
             <span className="hidden md:inline">•</span>
             <span>Returns: 7-15 Days Policy</span>
             <span className="hidden md:inline">•</span>
             <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">Terms of Service</button>
          </div>
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-6 text-center flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5">
            <span>Gigastore | The Future of Connection.</span>
            <span>© 2026.</span>
          </p>
          <div className="flex gap-8 mb-8">
            <button onClick={() => handleSocialClick(socialLinks.instagram)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Instagram size={18} /></button>
            <button onClick={() => handleSocialClick(socialLinks.x)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><FaXTwitter size={18} /></button>
            <button onClick={() => handleSocialClick(socialLinks.facebook)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Facebook size={18} /></button>
          </div>
        </div>
      </footer>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <CartSidebar
            cart={cart}
            user={user}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClearCart={() => setCart([])}
            onRequireAuth={() => {
              setIsCartOpen(false);
              setIsCustomerAuthOpen(true);
            }}
            onViewOrders={() => setIsProfileOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AnimatePresence>
        {isAdminOpen && user?.email?.toLowerCase() === 'vincentlewa6@gmail.com' && (
          <AdminPanel
            products={productsList}
            setProducts={setProductsList}
            slides={slidesList}
            setSlides={setSlidesList}
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            onClose={() => setIsAdminOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal
            onClose={() => setIsLoginOpen(false)}
            onLogin={() => {
              setIsLoginOpen(false);
              setIsAdminOpen(true);
            }}
          />
        )}
        
        {isCustomerAuthOpen && (
          <CustomerAuthModal
            onClose={() => setIsCustomerAuthOpen(false)}
            onSuccess={() => {
              setIsCustomerAuthOpen(false);
              // user is handled by auth listener
            }}
            onTermsClick={() => setIsTermsOpen(true)}
            onAdminLogin={() => {
              setIsCustomerAuthOpen(false);
              setUser({ email: 'vincentlewa6@gmail.com', id: 'admin-123' });
              setIsAdminOpen(true);
            }}
          />
        )}

        {isTermsOpen && (
          <TermsModal onClose={() => setIsTermsOpen(false)} />
        )}

        {isProfileOpen && (
          <ProfileSidebar
            user={user}
            onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenAuth={() => setIsCustomerAuthOpen(true)}
            onClose={() => setIsProfileOpen(false)}
            onLogout={() => {
              setIsProfileOpen(false);
              setUser(null);
              setWishlist([]);
              localStorage.removeItem('wishlist');
            }}
            cartCount={cartCount}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            products={productsList}
            onProductSelect={(product) => {
              setSelectedProduct(product);
              setIsProfileOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
