import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Search, Sparkles, RefreshCw, Trash2, Tag, ArrowRight } from 'lucide-react';
import { SyncLog, SyncLogItem } from '../types';
import { formatProductZMW, getDisplayPriceUSD } from '../utils';

interface SyncLogModalProps {
  syncLog: SyncLog | null;
  onClose: () => void;
  onFilterCatalog?: (addedNames: string[]) => void;
}

export function SyncLogModal({ syncLog, onClose, onFilterCatalog }: SyncLogModalProps) {
  if (!syncLog) return null;

  const [activeTab, setActiveTab] = useState<'added' | 'updated' | 'deleted'>(
    syncLog.addedCount > 0 ? 'added' : syncLog.updatedCount > 0 ? 'updated' : 'deleted'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const formattedDate = new Date(syncLog.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getFilteredItems = () => {
    let list: any[] = [];
    if (activeTab === 'added') list = syncLog.addedItems || [];
    else if (activeTab === 'updated') list = syncLog.updatedItems || [];
    else list = syncLog.deletedItems || [];

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      (item.name || '').toLowerCase().includes(q) || 
      (item.brand || '').toLowerCase().includes(q)
    );
  };

  const currentItems = getFilteredItems();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-black font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${syncLog.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {syncLog.status === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-black">Sync Activity Report</h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    syncLog.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {syncLog.status === 'success' ? 'Complete' : 'Failed'}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Synced on {formattedDate}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stat Cards Overview */}
          <div className="grid grid-cols-3 gap-3 p-6 bg-gray-50 border-b border-gray-100 shrink-0">
            <button
              onClick={() => setActiveTab('added')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === 'added'
                  ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Newly Added</span>
                <Sparkles size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600">+{syncLog.addedCount}</div>
              <p className="text-[10px] text-gray-400 font-medium">New items introduced</p>
            </button>

            <button
              onClick={() => setActiveTab('updated')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === 'updated'
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Updated</span>
                <RefreshCw size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-blue-600">{syncLog.updatedCount}</div>
              <p className="text-[10px] text-gray-400 font-medium">Prices & specs updated</p>
            </button>

            <button
              onClick={() => setActiveTab('deleted')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === 'deleted'
                  ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Removed</span>
                <Trash2 size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">-{syncLog.deletedCount}</div>
              <p className="text-[10px] text-gray-400 font-medium">Out-of-stock items</p>
            </button>
          </div>

          {/* Search bar inside modal */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-white shrink-0">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab} items...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-all"
              />
            </div>
            <div className="text-xs font-bold text-gray-500 shrink-0">
              Showing {currentItems.length} items
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
            {currentItems.length === 0 ? (
              <div className="text-center py-12">
                <Tag size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-600">No items in this category</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? 'Try matching a different search term.' : 'This sync session recorded 0 items for this tab.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 p-1">
                      {item.image ? (
                        <img src={item.image || undefined} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                      ) : (
                        <Tag size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                          {item.brand || 'Electronics'}
                        </span>
                        {activeTab === 'added' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-black truncate leading-snug">
                        {item.name}
                      </h4>
                      {item.price > 0 && (
                        <p className="text-xs font-black text-emerald-600 mt-1">
                          {formatProductZMW(item, getDisplayPriceUSD(item.price))}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
            {syncLog.addedCount > 0 && onFilterCatalog ? (
              <button
                onClick={() => {
                  const names = (syncLog.addedItems || []).map(i => i.name);
                  onFilterCatalog(names);
                  onClose();
                }}
                className="flex items-center gap-2 bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors shadow-md"
              >
                <Sparkles size={14} /> View New Products in Catalog <ArrowRight size={14} />
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={onClose}
              className="bg-gray-100 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
