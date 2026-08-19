const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add Settings icon
code = code.replace('Plus } from \'lucide-react\';', 'Plus, Settings } from \'lucide-react\';');

// 2. Add Social links to props
code = code.replace(
  '  onClose: () => void;\n}',
  '  onClose: () => void;\n  socialLinks?: { instagram: string, x: string, facebook: string };\n  setSocialLinks?: (links: { instagram: string, x: string, facebook: string }) => void;\n}'
);

code = code.replace(
  'export function AdminPanel({ products, setProducts, slides, setSlides, onClose }: AdminPanelProps) {',
  'export function AdminPanel({ products, setProducts, slides, setSlides, onClose, socialLinks = {instagram:"", x:"", facebook:""}, setSocialLinks }: AdminPanelProps) {'
);

// 3. Add active tab type
code = code.replace(
  'useState<\'dashboard\' | \'products\' | \'slides\' | \'sync_history\'>(\'dashboard\')',
  'useState<\'dashboard\' | \'products\' | \'slides\' | \'sync_history\' | \'settings\'>(\'dashboard\')'
);

// 4. Add editingSocialLinks state
code = code.replace(
  'const [editingSlides, setEditingSlides] = useState<Slide[]>(slides);',
  'const [editingSlides, setEditingSlides] = useState<Slide[]>(slides);\n  const [editingSocialLinks, setEditingSocialLinks] = useState(socialLinks);'
);

// 5. Add save logic for social links
const saveLogic = `
        const { error: settingsError } = await supabase.from('settings').upsert({ key: 'social_links', value: editingSocialLinks });
        if (settingsError) {
           console.error("Settings error:", settingsError);
           // Not a hard failure if table doesn't exist
        } else if (setSocialLinks) {
           setSocialLinks(editingSocialLinks);
        }
`;
code = code.replace(
  'if (hasError) {',
  saveLogic + '\n        if (hasError) {'
);

// 6. Add tab button for settings
const settingsTabBtn = `
                    <button
                      onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                      className={\`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 \${
                        activeTab === 'settings' ? 'bg-gray-50 text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }\`}
                    >
                      <Settings size={16} /> App Settings
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
`;
code = code.replace(
  '<div className="h-px bg-gray-100 my-1"></div>\n                    <button\n                      onClick={handleLogout}',
  settingsTabBtn + '                    <button\n                      onClick={handleLogout}'
);

// 7. Add Settings Panel content
const settingsPanel = `
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
            </div>
          )}
`;
code = code.replace(
  '          {activeTab === \'slides\' && (',
  settingsPanel + '\n          {activeTab === \'slides\' && ('
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
