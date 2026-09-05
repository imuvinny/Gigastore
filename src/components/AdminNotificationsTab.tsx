import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Send, Bell, User, CheckCircle2 } from 'lucide-react';

export function AdminNotificationsTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase.from('profiles').select('id, email, first_name, last_name, avatar_url').order('created_at', { ascending: false });
      if (data) {
        setProfiles(data);
      }
    }
    fetchProfiles();
  }, []);

  const handleSend = async () => {
    if (!selectedProfile || !message.trim() || !selectedProfile.email) return;
    setIsSending(true);
    setSuccess(false);

    try {
      const { error } = await supabase.from('notifications').insert({
        customer_email: selectedProfile.email,
        message: message.trim()
      });

      if (error) throw error;
      
      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Error sending notification", e);
    } finally {
      setIsSending(false);
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
        <h3 className="font-bold text-lg flex items-center gap-2"><Bell className="text-black" /> Send Notifications</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: User selection */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 flex flex-col h-[600px]">
          <h4 className="font-bold text-md border-b pb-4 mb-4">Select Client</h4>
          
          <div className="relative mb-4 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedProfile?.id === p.id ? 'bg-black text-white' : 'hover:bg-gray-50 text-black border border-transparent hover:border-gray-100'}`}
              >
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedProfile?.id === p.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <User size={16} />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{p.first_name} {p.last_name}</p>
                  <p className={`text-xs truncate ${selectedProfile?.id === p.id ? 'text-gray-300' : 'text-gray-500'}`}>{p.email}</p>
                </div>
              </button>
            )) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No clients found
              </div>
            )}
          </div>
        </div>

        {/* Right column: Message composer */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 flex flex-col h-[600px]">
          <h4 className="font-bold text-md border-b pb-4 mb-4">Compose Message</h4>
          
          {selectedProfile ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-2xl">
                <span className="text-sm text-gray-500">Sending to:</span>
                <span className="font-bold text-black">{selectedProfile.first_name} {selectedProfile.last_name}</span>
                <span className="text-sm text-gray-500">({selectedProfile.email})</span>
              </div>
              
              <div className="flex-1 flex flex-col mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Notification Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full flex-1 bg-gray-50 border border-gray-200 text-sm rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              <div className="flex justify-end shrink-0">
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className="bg-black text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : success ? (
                    <><CheckCircle2 size={18} /> Sent!</>
                  ) : (
                    <><Send size={18} /> Send Notification</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
              <User size={48} className="text-gray-200" />
              <p>Select a client from the list to compose a message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
