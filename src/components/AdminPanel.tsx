import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Database, Image as ImageIcon, Save, Terminal, Upload, 
  LayoutDashboard, Trash2, Menu, LogOut, History, Sparkles, 
  Search, ArrowUpDown, Filter, Eye, CheckCircle2, AlertCircle, Plus, Settings 
} from 'lucide-react';
import { Product, Slide, SyncLog } from '../types';
import { supabase } from '../lib/supabase';
import { DashboardTab } from './DashboardTab';
import { SyncLogModal } from './SyncLogModal';
import { formatProductZMW } from '../utils';

interface AdminPanelProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;
  onClose: () => void;
  socialLinks?: { instagram: string, x: string, facebook: string };
  setSocialLinks?: (links: { instagram: string, x: string, facebook: string }) => void;
}

export function AdminPanel({ products, setProducts, slides, setSlides, onClose, socialLinks = {instagram:"", x:"", facebook:""}, setSocialLinks }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'slides' | 'sync_history' | 'settings'>('dashboard');
  const [editingProducts, setEditingProducts] = useState<Product[]>(products);
  const [editingSlides, setEditingSlides] = useState<Slide[]>(slides);
  const [editingSocialLinks, setEditingSocialLinks] = useState(socialLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<{type: 'product'|'slide', index: number} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Log State & Filtering
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [selectedSyncLogModal, setSelectedSyncLogModal] = useState<SyncLog | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSort, setCatalogSort] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'price_high' | 'price_low'>('newest');
  const [showNewlyAddedOnly, setShowNewlyAddedOnly] = useState(false);

  // Fetch sync logs on mount
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/sync-logs');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.logs)) {
            setSyncLogs(data.logs);
          }
        }
      } catch (e) {
        console.error('Failed to fetch sync logs:', e);
      }
    }
    fetchLogs();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    if (supabase) {
      try {
        let hasError = false;
        let errorMessage = '';

        for (const p of editingProducts) {
          const pClean = { ...p };
          delete pClean.manualMarginZMW;
          const { error } = await supabase.from('products').upsert(pClean);
          if (error) {
            hasError = true;
            errorMessage = error.message;
            console.error("Products error:", error);
          }
        }
        
        // Handle deleted slides
        const deletedSlides = slides.filter(s => !editingSlides.find(es => es.id === s.id));
        for (const s of deletedSlides) {
          const { error } = await supabase.from('slides').delete().eq('id', s.id);
          if (error) {
            console.error("Slide deletion error:", error);
          }
        }

        for (const s of editingSlides) {
          const { error } = await supabase.from('slides').upsert(s);
          if (error) {
            hasError = true;
            errorMessage = error.message;
            console.error("Slides error:", error);
          }
        }

        
        const { error: settingsError } = await supabase.from('settings').upsert({ key: 'social_links', value: editingSocialLinks });
        if (settingsError) {
           console.error("Settings error:", settingsError);
           // Not a hard failure if table doesn't exist
        } else if (setSocialLinks) {
           setSocialLinks(editingSocialLinks);
        }

        if (hasError) {
          console.error(`Error saving to Supabase: ${errorMessage}`);
        } else {
          setProducts(editingProducts);
          setSlides(editingSlides);
        }
      } catch (e: any) {
        console.error("Error saving to Supabase:", e);
        console.error(`Unexpected error: ${e.message}`);
      }
    } else {
      setProducts(editingProducts);
      setSlides(editingSlides);
    }
    
    setIsSaving(false);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTarget || !supabase) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
        
      if (currentUploadTarget.type === 'product') {
        const newProducts = [...editingProducts];
        newProducts[currentUploadTarget.index].image = publicUrl;
        setEditingProducts(newProducts);
        const { error: updateError } = await supabase.from('products').upsert(newProducts[currentUploadTarget.index]);
        if (updateError) console.error(`Error saving product image to database: ${updateError.message}`);
      } else {
        const newSlides = [...editingSlides];
        newSlides[currentUploadTarget.index].image = publicUrl;
        setEditingSlides(newSlides);
        const { error: updateError } = await supabase.from('slides').upsert(newSlides[currentUploadTarget.index]);
        if (updateError) console.error(`Error saving slide image to database: ${updateError.message}`);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setCurrentUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSync = async () => {
    
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync', { method: 'POST' }).catch((err) => {
        throw new Error('Network error during sync execution.');
      });
      const data = await response.json();
      if (data.success) {
        if (data.syncLog) {
          setSyncLogs(prev => [data.syncLog, ...prev]);
          // Open detailed sync modal right away!
          setSelectedSyncLogModal(data.syncLog);
        }
        // Fetch fresh products from Supabase
        if (supabase) {
          const { data: freshProducts } = await supabase.from('products').select('*');
          if (freshProducts) {
            setEditingProducts(freshProducts);
            setProducts(freshProducts);
          }
        }
      } else {
        console.error('Sync failed: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error syncing:', error);
      console.error('Error triggering sync bot: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) {
        console.error('Failed to delete product from database: ' + error.message);
        return;
      }
    }
    const updated = editingProducts.filter(p => p.id !== product.id);
    setEditingProducts(updated);
    setProducts(updated);
  };

  const triggerUpload = (type: 'product' | 'slide', index: number) => {
    setCurrentUploadTarget({ type, index });
    fileInputRef.current?.click();
  };

  // Get set of names from latest sync's added items
  const latestSyncLog = syncLogs.length > 0 ? syncLogs[0] : null;
  const latestAddedNames = new Set((latestSyncLog?.addedItems || []).map(i => i.name));

  // Filter and sort catalog products
  const getProcessedProducts = () => {
    let result = [...editingProducts];

    // Search filter
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.brand || '').toLowerCase().includes(q)
      );
    }

    // Newly Added filter toggle
    if (showNewlyAddedOnly) {
      result = result.filter(p => latestAddedNames.has(p.name));
    }

    // Sorting
    result.sort((a, b) => {
      if (catalogSort === 'newest') {
        const aIsNew = latestAddedNames.has(a.name) ? 1 : 0;
        const bIsNew = latestAddedNames.has(b.name) ? 1 : 0;
        if (aIsNew !== bIsNew) return bIsNew - aIsNew;
        return 0;
      }
      if (catalogSort === 'oldest') {
        const aIsNew = latestAddedNames.has(a.name) ? 1 : 0;
        const bIsNew = latestAddedNames.has(b.name) ? 1 : 0;
        if (aIsNew !== bIsNew) return aIsNew - bIsNew;
        return 0;
      }
      if (catalogSort === 'name_asc') return a.name.localeCompare(b.name);
      if (catalogSort === 'name_desc') return b.name.localeCompare(a.name);
      if (catalogSort === 'price_high') return b.price - a.price;
      if (catalogSort === 'price_low') return a.price - b.price;
      return 0;
    });

    return result;
  };

  const processedProducts = getProcessedProducts();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-white text-black font-sans"
    >
      <div className="w-full h-full bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center w-10 h-10"
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
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        activeTab === 'dashboard' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                      onClick={() => { setActiveTab('products'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        activeTab === 'products' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <Terminal size={16} /> Products (Catalog)
                    </button>
                    <button
                      onClick={() => { setActiveTab('sync_history'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        activeTab === 'sync_history' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <History size={16} /> Sync Activity Log
                    </button>
                    <button
                      onClick={() => { setActiveTab('slides'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        activeTab === 'slides' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <ImageIcon size={16} /> Hero Slides
                    </button>
                    
                    <button
                      onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        activeTab === 'settings' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <Settings size={16} /> App Settings
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <h2 className="text-lg font-black tracking-tight text-black capitalize">
              {activeTab === 'products' ? 'Products Catalog' : activeTab === 'sync_history' ? 'Sync Activity Log' : activeTab}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 shrink-0 shadow-md"
            >
              <Database size={14} className={isSyncing ? 'animate-bounce' : ''} /> 
              <span>{isSyncing ? 'Syncing Plug.tech...' : 'Run Sync Bot'}</span>
            </button>

            {activeTab !== 'dashboard' && activeTab !== 'sync_history' && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 shrink-0 shadow-md"
              >
                <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}

            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardTab products={editingProducts} />
          )}

          {activeTab === 'sync_history' && (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-black/5 overflow-hidden p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-black">Inventory Sync History Log</h3>
                  <p className="text-xs text-gray-500 mt-1">Detailed sessions recorded from automated plug.tech inventory sync runs.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-xl text-gray-700">
                    Total Sessions: {syncLogs.length}
                  </div>
                  {syncLogs.length > 0 && (
                    <button 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete all sync history logs? This cannot be undone.')) {
                          try {
                            const res = await fetch('/api/sync-logs', { method: 'DELETE' });
                            const data = await res.json();
                            if (data.success) {
                              setSyncLogs([]);
                            } else {
                              console.error('Failed to delete logs: ' + (data.error || 'Unknown error'));
                            }
                          } catch (err) {
                            console.error('Failed to delete logs. Check network connection.');
                          }
                        }
                      }}
                      className="text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Clear Logs
                    </button>
                  )}
                </div>
              </div>

              {syncLogs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <History size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-700">No sync history recorded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Run Sync Bot" above to perform an inventory sync session.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left text-sm text-gray-800">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-4">Timestamp</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Added Items</th>
                        <th className="px-5 py-4">Updated Items</th>
                        <th className="px-5 py-4">Removed Items</th>
                        <th className="px-5 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {syncLogs.map((log) => {
                        const dateStr = new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-5 py-4 font-bold text-black text-xs">
                              {dateStr}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {log.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-black text-emerald-600 text-xs">
                              +{log.addedCount} items
                            </td>
                            <td className="px-5 py-4 font-bold text-blue-600 text-xs">
                              {log.updatedCount} items
                            </td>
                            <td className="px-5 py-4 font-bold text-amber-600 text-xs">
                              -{log.deletedCount} items
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => setSelectedSyncLogModal(log)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-black font-bold text-xs rounded-xl transition-colors shadow-sm"
                              >
                                <Eye size={14} /> Inspect Report
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Controls Header Bar: Search, Sorting & Filter Toggles */}
              <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product inventory by name or brand..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2 pl-10 pr-4 text-xs font-medium text-black focus:outline-none focus:border-black transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  {/* Newly Added Filter Toggle Button */}
                  <button
                    onClick={() => setShowNewlyAddedOnly(!showNewlyAddedOnly)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                      showNewlyAddedOnly
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>Newly Added ({latestAddedNames.size})</span>
                  </button>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-2xl px-3 py-1.5 text-xs font-bold text-gray-700 shrink-0">
                    <ArrowUpDown size={14} className="text-gray-400" />
                    <span>Sort:</span>
                    <select
                      value={catalogSort}
                      onChange={(e: any) => setCatalogSort(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-black text-xs cursor-pointer"
                    >
                      <option value="newest">Newest First (Recently Synced)</option>
                      <option value="oldest">Default Order</option>
                      <option value="name_asc">Name (A - Z)</option>
                      <option value="name_desc">Name (Z - A)</option>
                      <option value="price_high">Price (High to Low)</option>
                      <option value="price_low">Price (Low to High)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-800">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Name</th>
                      <th className="px-5 py-4 w-28">Base Price (ZMW)</th>
                      <th className="px-5 py-4 w-28">Margin (K)</th>
                      <th className="px-5 py-4 w-1/3">Image URL</th>
                      <th className="px-5 py-4">Preview</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {processedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-gray-400 font-medium text-xs">
                          No inventory items match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      processedProducts.map((product) => {
                        const originalIndex = editingProducts.findIndex(p => p.id === product.id);
                        const isNewArrival = latestAddedNames.has(product.name);

                        return (
                          <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-5 py-4">
                              {isNewArrival ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  <Sparkles size={10} /> NEW
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400 uppercase">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 font-bold text-black">
                              {product.name}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                                <span className="text-gray-400 font-bold text-xs mr-1">K</span>
                                <input
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => {
                                    if (originalIndex !== -1) {
                                      const newProducts = [...editingProducts];
                                      newProducts[originalIndex].price = parseFloat(e.target.value) || 0;
                                      setEditingProducts(newProducts);
                                    }
                                  }}
                                  className="bg-transparent border-none outline-none w-20 text-xs font-bold text-black"
                                />
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                                <span className="text-gray-400 font-bold text-xs mr-1">+K</span>
                                <input
                                  type="number"
                                  placeholder="Auto"
                                  value={product.manualMarginZMW ?? ''}
                                  onChange={(e) => {
                                    if (originalIndex !== -1) {
                                      const newProducts = [...editingProducts];
                                      newProducts[originalIndex].manualMarginZMW = e.target.value ? parseFloat(e.target.value) : undefined;
                                      setEditingProducts(newProducts);
                                    }
                                  }}
                                  className="bg-transparent border-none outline-none w-20 text-xs font-bold text-black"
                                />
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                                  <ImageIcon size={14} className="text-gray-400 mr-2 shrink-0" />
                                  <input
                                    type="text"
                                    value={product.image}
                                    onChange={(e) => {
                                      if (originalIndex !== -1) {
                                        const newProducts = [...editingProducts];
                                        newProducts[originalIndex].image = e.target.value;
                                        setEditingProducts(newProducts);
                                      }
                                    }}
                                    className="bg-transparent border-none outline-none w-full text-xs text-black font-mono"
                                    placeholder="Paste image URL here..."
                                  />
                                </div>
                                {supabase && originalIndex !== -1 && (
                                  <button
                                    onClick={() => triggerUpload('product', originalIndex)}
                                    disabled={uploading}
                                    className="p-2 bg-gray-100 hover:bg-black hover:text-white text-black rounded-xl border border-gray-200 transition-colors"
                                    title="Upload from computer"
                                  >
                                    <Upload size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden p-1">
                                {product.image && <img src={product.image} alt="preview" className="w-full h-full object-contain mix-blend-multiply" />}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="p-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-colors"
                                title="Delete product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg">App Settings</h3>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 space-y-6">
                <h4 className="font-bold text-md border-b pb-2">Social Media Links</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Instagram URL</label>
                    <input 
                      type="url" 
                      value={editingSocialLinks.instagram}
                      onChange={e => setEditingSocialLinks({...editingSocialLinks, instagram: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">X (Twitter) URL</label>
                    <input 
                      type="url" 
                      value={editingSocialLinks.x}
                      onChange={e => setEditingSocialLinks({...editingSocialLinks, x: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Facebook URL</label>
                    <input 
                      type="url" 
                      value={editingSocialLinks.facebook}
                      onChange={e => setEditingSocialLinks({...editingSocialLinks, facebook: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm mt-6">
                <h4 className="font-bold text-md text-red-700 border-b border-red-200 pb-2 mb-4">Danger Zone</h4>
                <div className="flex flex-col gap-2">
                   <p className="text-sm text-red-600 mb-3">Resetting dashboard data will permanently delete all Visits, Company Earnings, and Orders from the database. This is useful for starting over in a new year.</p>
                   <button 
                     onClick={async () => {
                        if (window.confirm("Are you absolutely sure you want to delete ALL Visits, Earnings, and Orders? This action cannot be undone.")) {
                            try {
                               if (supabase) {
                                 await supabase.from('visits').delete().gte('created_at', '2000-01-01');
                                 await supabase.from('company_earnings').delete().gte('created_at', '2000-01-01');
                                 await supabase.from('orders').delete().gte('created_at', '2000-01-01');
                                 console.error("Dashboard data has been reset successfully. Please refresh the page to see changes.");
                               }
                            } catch (e) {
                               console.error("Error resetting data. Check console for details.");
                               console.error(e);
                            }
                        }
                     }}
                     className="bg-red-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-red-700 transition-colors w-fit shadow-md shadow-red-600/20"
                   >
                     Reset Dashboard Data
                   </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'slides' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg">Manage Slides</h3>
                <button
                  onClick={() => {
                    const newId = editingSlides.length > 0 ? Math.max(...editingSlides.map(s => s.id)) + 1 : 1;
                    setEditingSlides([...editingSlides, {
                      id: newId,
                      titleLines: ["NEW", "SLIDE"],
                      accentText: "NEW PRODUCT DESCRIPTION.",
                      specs: "New specs here.",
                      color: "#ffffff",
                      image: ""
                    }]);
                  }}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                >
                  <Plus size={16} /> Add Slide
                </button>
              </div>

              {editingSlides.map((slide, index) => (
                <div key={slide.id} className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-black/5 overflow-hidden p-6 relative group">
                  <button
                    onClick={() => {
                      const newSlides = editingSlides.filter(s => s.id !== slide.id);
                      setEditingSlides(newSlides);
                    }}
                    className="absolute top-6 right-6 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Slide"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Title Lines (one per line)</label>
                        <textarea
                          value={(slide.titleLines || []).join('\n')}
                          onChange={(e) => {
                            const newSlides = [...editingSlides];
                            newSlides[index].titleLines = e.target.value.split('\n');
                            setEditingSlides(newSlides);
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black font-black leading-[0.9] tracking-tighter focus:outline-none focus:border-black transition-all"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Accent Text (Bottom text)</label>
                        <input
                          type="text"
                          value={slide.accentText || ''}
                          onChange={(e) => {
                            const newSlides = [...editingSlides];
                            newSlides[index].accentText = e.target.value;
                            setEditingSlides(newSlides);
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold tracking-widest uppercase text-black focus:outline-none focus:border-black transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Specs Text</label>
                        <input
                          type="text"
                          value={slide.specs || ''}
                          onChange={(e) => {
                            const newSlides = [...editingSlides];
                            newSlides[index].specs = e.target.value;
                            setEditingSlides(newSlides);
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-black focus:outline-none focus:border-black transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Accent Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={slide.color || '#ffffff'}
                              onChange={(e) => {
                                const newSlides = [...editingSlides];
                                newSlides[index].color = e.target.value;
                                setEditingSlides(newSlides);
                              }}
                              className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                              type="text"
                              value={slide.color || '#ffffff'}
                              onChange={(e) => {
                                const newSlides = [...editingSlides];
                                newSlides[index].color = e.target.value;
                                setEditingSlides(newSlides);
                              }}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-black font-mono focus:outline-none focus:border-black transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-black transition-all">
                          <ImageIcon size={16} className="text-gray-400 mr-2 shrink-0" />
                          <input
                            type="text"
                            value={slide.image || ''}
                            onChange={(e) => {
                              const newSlides = [...editingSlides];
                              newSlides[index].image = e.target.value;
                              setEditingSlides(newSlides);
                            }}
                            className="bg-transparent border-none outline-none w-full text-xs text-black font-mono"
                            placeholder="Paste image URL here..."
                          />
                        </div>
                        {supabase && (
                          <button
                            onClick={() => triggerUpload('slide', index)}
                            disabled={uploading}
                            className="p-2.5 bg-gray-100 hover:bg-black hover:text-white text-black rounded-xl border border-gray-200 transition-colors"
                            title="Upload from computer"
                          >
                            <Upload size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center p-4 overflow-hidden mt-2" style={{ background: `radial-gradient(circle at 50% 50%, ${(slide.color || '#ffffff')}20 0%, transparent 100%)` }}>
                        {slide.image ? (
                          <img src={slide.image} alt="preview" className="max-w-full max-h-[200px] object-contain drop-shadow-xl" />
                        ) : (
                          <span className="text-gray-400 text-sm font-medium flex flex-col items-center gap-2">
                            <ImageIcon size={32} className="opacity-20" />
                            No image provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render Sync Log Modal */}
      <SyncLogModal
        syncLog={selectedSyncLogModal}
        onClose={() => setSelectedSyncLogModal(null)}
        onFilterCatalog={(addedNames) => {
          setActiveTab('products');
          setShowNewlyAddedOnly(true);
        }}
      />
    </motion.div>
  );
}
