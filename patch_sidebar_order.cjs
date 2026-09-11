const fs = require('fs');

let content = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf8');

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

// Remove the support menu item from the top
content = content.replace(supportMenuItem, "");

// Add it after Notifications
const notificationsMenuItem = `          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <Bell size={16} /> Notifications
            </h3>
            <div 
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                setExpandedSection('notifications');
                // Mark all as read when opening
                if (userEmail && notifications.some(n => !n.read)) {
                  supabase.from('notifications').update({ read: true }).eq('customer_email', userEmail).then(() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  });
                }
              }}
            >
              <div>
                <p className="text-black font-medium">Inbox</p>
                <p className="text-xs text-gray-500">Tap to view messages</p>
              </div>
              <div className={\`w-8 h-8 rounded-full \${visibleNotifications.filter(n => !n.read).length > 0 ? 'bg-red-500' : 'bg-black'} text-white font-bold flex items-center justify-center text-sm shadow-sm\`}>
                {visibleNotifications.filter(n => !n.read).length || 0}
              </div>
            </div>
          </div>`;

content = content.replace(notificationsMenuItem, notificationsMenuItem + "\n\n" + supportMenuItem);

fs.writeFileSync('src/components/ProfileSidebar.tsx', content);
