const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Ensure MessageSquare is imported
if (!content.includes('MessageSquare')) {
  content = content.replace(
    "import { History,",
    "import { History, MessageSquare,"
  );
}

const notificationsButton = `                        <button
                          onClick={() => { setActiveTab('notifications'); setIsMenuOpen(false); }}
                          className={\`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 \${
                            activeTab === 'notifications' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                          }\`}
                        >
                          <Bell size={16} /> Notifications
                        </button>`;

const supportButton = `                        <button
                          onClick={() => { setActiveTab('support'); setIsMenuOpen(false); }}
                          className={\`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 \${
                            activeTab === 'support' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                          }\`}
                        >
                          <MessageSquare size={16} /> Support Messages
                        </button>`;

content = content.replace(notificationsButton, notificationsButton + "\n" + supportButton);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
