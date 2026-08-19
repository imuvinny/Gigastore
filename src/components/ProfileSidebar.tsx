import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Search, ShoppingBag, LogOut, LogIn, User, Camera, LayoutDashboard, ChevronDown, ChevronUp, Package } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { formatRawZMW, getOrderFinalZMW } from '../utils';

interface ProfileSidebarProps {
  user?: any;
  onClose: () => void;
  onLogout: () => void;
  cartCount: number;
  onProfileUpdate?: (profile: any) => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
  wishlist?: Product[];
  toggleWishlist?: (product: Product) => void;
  products?: Product[];
  onProductSelect?: (product: Product) => void;
}

export function ProfileSidebar({ user, onClose, onLogout, cartCount, onProfileUpdate, onOpenAdmin, onOpenAuth, wishlist = [], toggleWishlist, products = [], onProductSelect }: ProfileSidebarProps) {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(user || null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [expandedSection, setExpandedSection] = useState<'wishlist' | 'purchases' | 'searches' | null>(null);

  useEffect(() => {
    let orderSubscription: any = null;

    async function getUser() {
      if (!supabase) return;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUser = authUser || user;
      if (currentUser) {
        setUserAuth(currentUser);
        setUserEmail(currentUser.email || '');
        
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || (currentUser.user_metadata?.first_name ? `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name}` : '');
        
        const fetchOrders = async () => {
          const { data: orders } = await supabase.from('orders').select('*').eq('user_id', currentUser.id).neq('status', 'pending').order('created_at', { ascending: false }).limit(20);
          if (orders) setRecentOrders(orders);
        };
        await fetchOrders();
        
        orderSubscription = supabase.channel(`user-orders-${currentUser.id}-${Date.now()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${currentUser.id}` }, () => {
            fetchOrders();
          }).subscribe();

        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (data) {
           setProfile(data);
           setUserName((data.first_name && data.last_name) ? `${data.first_name} ${data.last_name}` : (metaName || 'My Profile'));
        } else {
           setUserName(metaName || 'My Profile');
        }
      } else {
        setUserAuth(null);
        setUserEmail('');
        setUserName('Guest Account');
      }
    }
    getUser();

    return () => {
      if (orderSubscription && supabase) {
        supabase.removeChannel(orderSubscription);
      }
    };
  }, [user]);

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    const metaName = userAuth?.user_metadata?.full_name || userAuth?.user_metadata?.name;
    if (metaName) {
      const parts = metaName.split(' ').filter(Boolean);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (userAuth?.user_metadata?.first_name && userAuth?.user_metadata?.last_name) {
      return `${userAuth.user_metadata.first_name[0]}${userAuth.user_metadata.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase || !userAuth) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userAuth.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userAuth.id);
      if (updateError) throw updateError;
      
      const updatedProfile = { ...profile, avatar_url: publicUrl };
      setProfile(updatedProfile);
      if (onProfileUpdate) onProfileUpdate(updatedProfile);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      onLogout();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex justify-end"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-black/10 flex flex-col"
      >
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-black overflow-hidden relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : getInitials() ? (
                  <span className="text-sm font-bold text-gray-600">{getInitials()}</span>
                ) : (
                  <User size={20} className="text-gray-400" />
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors z-10 text-black">
                <Camera size={12} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-black">{userName || 'My Profile'}</h2>
                {userEmail?.toLowerCase() === 'vincentlewa6@gmail.com' && (
                  <button 
                    onClick={() => {
                      if (onOpenAdmin) onOpenAdmin();
                      onClose();
                    }}
                    className="p-1.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{userEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white">
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <Package size={16} /> Orders
            </h3>
            
            <div 
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedSection('purchases')}
            >
              <div>
                <p className="text-black font-medium">My Orders</p>
                <p className="text-xs text-gray-500">Tap to view your active orders</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {recentOrders ? recentOrders.length : 0}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <Heart size={16} /> Wishlist
            </h3>
            <div 
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedSection('wishlist')}
            >
              <div>
                <p className="text-black font-medium">Saved Items</p>
                <p className="text-xs text-gray-500">Tap to view your wishlist</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {wishlist.length}
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          {userAuth || user ? (
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-black/10"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-black/10"
            >
              <LogIn size={18} />
              Sign In / Create Account
            </button>
          )}
        </div>
      </motion.div>

      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {expandedSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpandedSection(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight text-[#0f0c0c]">
                  {expandedSection === 'wishlist' ? <><Heart className="text-black" /> Saved Items</> : expandedSection === 'purchases' ? <><Package className="text-black" /> My Orders</> : <><Search className="text-black" /> Recent Searches</>}
                </h2>
                <button onClick={() => setExpandedSection(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-6 bg-gray-50 flex-1">
                {expandedSection === 'wishlist' && (
                  wishlist.length > 0 ? (
                    <div className="space-y-3">
                      {wishlist.map(product => (
                        <div 
                          key={product.id} 
                          className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center cursor-pointer hover:border-black/20 hover:shadow-lg transition-all group"
                          onClick={() => {
                            if (onProductSelect) {
                              onProductSelect(product);
                            }
                          }}
                        >
                          <div className="w-16 h-16 bg-gray-50 rounded-xl border border-black/5 p-2 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-black line-clamp-2">{product.name}</h4>
                            <p className="text-xs text-gray-500 font-medium">{product.brand}</p>
                          </div>
                          {toggleWishlist && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product);
                              }}
                              className="p-3 hover:bg-gray-100 rounded-full transition-colors text-black shrink-0"
                            >
                              <Heart size={20} className="fill-black" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                      <Heart size={32} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-black font-bold mb-2">Your wishlist is empty</p>
                      <p className="text-sm text-gray-500">Save items to view them later.</p>
                    </div>
                  )
                )}

                {expandedSection === 'purchases' && (
                  recentOrders && recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map(order => (
                        <div 
                          key={order.id} 
                          className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-black/20 hover:shadow-lg transition-all group"
                          onClick={() => {
                            if (onProductSelect && products && products.length > 0) {
                              // Try to find the exact product matching the order name
                              const product = products.find(p => p.name === order.product_name);
                              if (product) {
                                onProductSelect(product);
                              }
                            }
                          }}
                        >
                          <div className="flex gap-4 items-center">
                            {order.image_url ? (
                              <div className="w-16 h-16 bg-gray-50 rounded-xl border border-black/5 p-2 flex-shrink-0">
                                <img src={order.image_url} alt={order.product_name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-50 rounded-xl border border-black/5 p-2 flex-shrink-0 flex items-center justify-center text-gray-400">
                                <ShoppingBag size={24} />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-black line-clamp-2 leading-tight">{order.product_name}</h4>
                              <p className="text-xs text-gray-500 font-medium mt-1">Order #{order.order_number || order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()} • {order.status}</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</span>
                            <span className="text-lg font-black text-black">
                              {formatRawZMW(getOrderFinalZMW(order))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                      <ShoppingBag size={32} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-black font-bold mb-2">No recent purchases</p>
                      <p className="text-sm text-gray-500">Your order history will appear here.</p>
                    </div>
                  )
                )}
                
                {expandedSection === 'searches' && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <Search size={32} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-black font-bold mb-2">No recent searches</p>
                    <p className="text-sm text-gray-500">Your search history will appear here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
