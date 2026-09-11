const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add Import
content = content.replace(
  "import { AdminNotificationsTab } from './AdminNotificationsTab';",
  "import { AdminNotificationsTab } from './AdminNotificationsTab';\nimport { AdminSupportTab } from './AdminSupportTab';"
);

// 2. Add menu item
const supportMenu = `                          <button
                            onClick={() => setActiveTab('support')}
                            className={\`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 \${
                              activeTab === 'support' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                            }\`}
                          >
                            <MessageSquare size={18} /> Support Messages
                          </button>
`;

content = content.replace(
  "                          <button\n                            onClick={() => setActiveTab('subadmins')}",
  supportMenu + "\n                          <button\n                            onClick={() => setActiveTab('subadmins')}"
);

// 3. Add component render
const supportComponent = `
          {activeTab === 'support' && isMainAdmin && (
            <AdminSupportTab />
          )}
`;

content = content.replace(
  "          {activeTab === 'subadmins' && isMainAdmin && (",
  supportComponent + "\n          {activeTab === 'subadmins' && isMainAdmin && ("
);

// 4. Update title
content = content.replace(
  "activeTab === 'notifications' ? 'Send Notifications' : activeTab}",
  "activeTab === 'notifications' ? 'Send Notifications' : activeTab === 'support' ? 'Support Messages' : activeTab}"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
