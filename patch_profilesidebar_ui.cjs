const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf-8');

const targetStr = `          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <Search size={16} /> Recent Searches
            </h3>`;

const newStr = `          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <ShoppingBag size={16} /> Recent Purchases
            </h3>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                    {order.image_url ? (
                      <div className="w-12 h-12 bg-white rounded-xl border border-black/10 p-1 flex-shrink-0">
                        <img src={order.image_url} alt={order.product_name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-xl border border-black/10 p-1 flex-shrink-0 flex items-center justify-center text-gray-400">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-black line-clamp-1">{order.product_name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString()} • {order.status}</p>
                    </div>
                    <div className="text-sm font-bold text-black">
                      {formatProductZMW(order.total_price)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-sm text-gray-500 text-center">No recent purchases</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4 flex items-center gap-2">
              <Search size={16} /> Recent Searches
            </h3>`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/ProfileSidebar.tsx', code);
console.log("Patched ProfileSidebar UI");
