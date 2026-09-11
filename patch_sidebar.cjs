const fs = require('fs');

let content = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf8');

// Add imports
content = content.replace(
  "import { X, Heart, Search, ShoppingBag, LogOut, LogIn, User, Camera, LayoutDashboard, ChevronDown, ChevronUp, Package, Bell, Trash2 } from 'lucide-react';",
  "import { X, Heart, Search, ShoppingBag, LogOut, LogIn, User, Camera, LayoutDashboard, ChevronDown, ChevronUp, Package, Bell, Trash2, MessageSquare, Send } from 'lucide-react';"
);

// Update state
content = content.replace(
  "const [expandedSection, setExpandedSection] = useState<'wishlist' | 'purchases' | 'searches' | 'notifications' | null>(null);",
  "const [expandedSection, setExpandedSection] = useState<'wishlist' | 'purchases' | 'searches' | 'notifications' | 'support' | null>(null);\n  const [supportMessage, setSupportMessage] = useState('');\n  const [isSendingSupport, setIsSendingSupport] = useState(false);"
);

// Add support menu item
const supportMenuItem = `          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Help & Support
            </h3>
            <div 
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedSection('support')}
            >
              <div>
                <p className="text-black font-medium">Contact Support</p>
                <p className="text-xs text-gray-500">Send us a message or call us</p>
              </div>
            </div>
          </div>`;

content = content.replace(
  "        <div className=\"flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white\">",
  "        <div className=\"flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white\">\n" + supportMenuItem
);

// Add support modal title
content = content.replace(
  "{expandedSection === 'wishlist' ? <><Heart className=\"text-black\" /> Saved Items</> : expandedSection === 'purchases' ? <><Package className=\"text-black\" /> My Orders</> : expandedSection === 'notifications' ? <><Bell className=\"text-black\" /> Notifications</> : <><Search className=\"text-black\" /> Recent Searches</>}",
  "{expandedSection === 'wishlist' ? <><Heart className=\"text-black\" /> Saved Items</> : expandedSection === 'purchases' ? <><Package className=\"text-black\" /> My Orders</> : expandedSection === 'notifications' ? <><Bell className=\"text-black\" /> Notifications</> : expandedSection === 'support' ? <><MessageSquare className=\"text-black\" /> Help & Support</> : <><Search className=\"text-black\" /> Recent Searches</>}"
);

// Add handleSendSupport
const supportHandlers = `  const handleSendSupport = async () => {
    if (!supportMessage.trim() || !userEmail) return;
    setIsSendingSupport(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        customer_email: userEmail,
        message: \`[Support Ticket] \${supportMessage}\`,
        read: false
      });
      if (!error) {
        setSupportMessage('');
        alert('Your message has been sent to our support team!');
        setExpandedSection(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingSupport(false);
    }
  };`;

content = content.replace(
  "  const handleHideNotification = ",
  supportHandlers + "\n\n  const handleHideNotification = "
);

// Add support modal body
const supportModalBody = `                {expandedSection === 'support' && (
                  <div className="flex flex-col h-full space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#5d3fd3]">
                        <MessageSquare size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">How can we help?</h3>
                      <p className="text-sm text-gray-500 mb-6">Send us a message and we'll get back to you as soon as possible.</p>
                      
                      <div className="flex flex-col gap-4">
                        <textarea
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Type your message here..."
                          className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        />
                        <button
                          onClick={handleSendSupport}
                          disabled={isSendingSupport || !supportMessage.trim()}
                          className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSendingSupport ? 'Sending...' : <><Send size={18} /> Send Message</>}
                        </button>
                        
                        <div className="relative flex items-center py-2">
                          <div className="flex-grow border-t border-gray-200"></div>
                          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                          <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <a 
                          href="tel:+260769312932" 
                          className="w-full bg-white border-2 border-black hover:bg-gray-50 text-black font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
                        >
                          Call Support
                        </a>
                      </div>
                    </div>
                  </div>
                )}`;

content = content.replace(
  "{expandedSection === 'searches' && (",
  supportModalBody + "\n\n                {expandedSection === 'searches' && ("
);

fs.writeFileSync('src/components/ProfileSidebar.tsx', content);
