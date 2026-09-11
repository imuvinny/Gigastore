import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SupportTicket } from '../types';
import { Search, Loader2, Send, MessageSquare, Reply, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminSupportTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    try {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setTickets(data);
      }
    } catch (e) {
      console.error('Error fetching tickets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('support_tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSendReply = async (ticket: SupportTicket) => {
    if (!replyMessage.trim()) return;
    setSending(true);
    
    try {
      // Send notification to the user
      await supabase.from('notifications').insert({
        customer_email: ticket.customer_email,
        message: `[Support Reply] ${replyMessage}`,
        read: false
      });
      
      // Mark ticket as read
      await supabase.from('support_tickets').update({ read: true }).eq('id', ticket.id);
      
      alert(`Reply sent to ${ticket.customer_email}`);
      setReplyMessage('');
      setReplyingTo(null);
      fetchTickets();
    } catch (e) {
      console.error(e);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (id: string, readStatus: boolean) => {
    await supabase.from('support_tickets').update({ read: readStatus }).eq('id', id);
    fetchTickets();
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      await supabase.from('support_tickets').delete().eq('id', id);
      fetchTickets();
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.customer_email.toLowerCase().includes(search.toLowerCase()) || 
    t.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-1">Support Messages</h2>
            <p className="text-sm text-gray-500">View and reply to customer support requests.</p>
          </div>
          
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-4 text-black" />
              <p>Loading support tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No support tickets</h3>
              <p className="text-gray-500">No support tickets match your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white border \${ticket.read ? 'border-gray-200' : 'border-blue-300 shadow-md'} rounded-2xl overflow-hidden`}
                  >
                    <div className="p-5 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md \${ticket.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                            {ticket.read ? 'RESOLVED' : 'NEW'}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{ticket.customer_email}</span>
                          <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{ticket.message}</p>
                      </div>
                      <div className="flex items-start justify-end gap-2 shrink-0">
                        <button
                          onClick={() => setReplyingTo(replyingTo === ticket.id ? null : ticket.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                          <Reply size={16} /> Reply
                        </button>
                        <button
                          onClick={() => handleMarkAsRead(ticket.id, !ticket.read)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={ticket.read ? "Mark as New" : "Mark as Resolved"}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {replyingTo === ticket.id && (
                      <div className="bg-blue-50 p-5 border-t border-blue-100">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder={`Type your reply to ${ticket.customer_email}...`}
                          className="w-full bg-white border border-blue-200 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px] mb-3 text-black"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyMessage('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(ticket)}
                            disabled={sending || !replyMessage.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
