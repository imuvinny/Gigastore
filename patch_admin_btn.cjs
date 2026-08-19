const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf-8');

const targetHeader = `            <div>
              <h2 className="text-lg font-bold text-black">{userName || 'My Profile'}</h2>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{userEmail}</p>
            </div>`;

const newHeader = `            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-black">{userName || 'My Profile'}</h2>
                {userEmail?.toLowerCase() === 'vincentlewa6@gmail.com' && (
                  <button 
                    onClick={() => {
                      if (onOpenAdmin) onOpenAdmin();
                      onClose();
                    }}
                    className="p-1.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{userEmail}</p>
            </div>`;

code = code.replace(targetHeader, newHeader);

const oldAdminBtn = `          {userEmail?.toLowerCase() === 'vincentlewa6@gmail.com' && (
            <div className="mt-4 px-6 md:px-8 mb-6">
              <button 
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                  onClose();
                }}
                className="w-full flex items-center justify-between bg-black text-white p-4 rounded-2xl hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold">
                  <LayoutDashboard size={18} /> Admin Dashboard
                </div>
              </button>
            </div>
          )}`;

code = code.replace(oldAdminBtn, '');

fs.writeFileSync('src/components/ProfileSidebar.tsx', code);
