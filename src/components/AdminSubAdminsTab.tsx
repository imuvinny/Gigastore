import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Shield, ShieldCheck, User, CheckCircle2 } from 'lucide-react';

export function AdminSubAdminsTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('id, email, first_name, last_name, avatar_url, is_subadmin').order('created_at', { ascending: false });
    if (data) {
      setProfiles(data);
    }
  }

  const toggleSubAdmin = async (profileId: string, currentStatus: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('profiles').update({ is_subadmin: !currentStatus }).eq('id', profileId);
      if (!error) {
        setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, is_subadmin: !currentStatus } : p));
      }
    } catch (e) {
      console.error("Error updating subadmin status", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg flex items-center gap-2"><Shield className="text-black" /> Manage Sub-Admins</h3>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 flex flex-col min-h-[600px]">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h4 className="font-bold text-md">Users List</h4>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{profiles.filter(p => p.is_subadmin).length} Sub-Admins</span>
        </div>
        
        <div className="relative mb-6 shrink-0 w-full md:w-1/2">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
            <div
              key={p.id}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm">
                    <User size={18} className="text-gray-400" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-black flex items-center gap-2">
                    {p.first_name} {p.last_name} 
                    {p.email?.toLowerCase() === 'vincentlewa6@gmail.com' && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">Main Admin</span>}
                    {p.is_subadmin && p.email?.toLowerCase() !== 'vincentlewa6@gmail.com' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Sub-Admin</span>}
                  </p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </div>
              
              {p.email?.toLowerCase() !== 'vincentlewa6@gmail.com' && (
                <button
                  onClick={() => toggleSubAdmin(p.id, p.is_subadmin)}
                  disabled={isUpdating}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                    p.is_subadmin 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {p.is_subadmin ? 'Revoke Access' : 'Make Sub-Admin'}
                </button>
              )}
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500 text-sm bg-gray-50 rounded-2xl">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
