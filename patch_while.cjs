const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexWhileEnd = /          \}\n        \}\n      \}\n      \n      \/\/ Clean up products no longer listed in active sync/;

const replacementWhileEnd = `          }
        }
        if (products.length < 250) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      // Clean up products no longer listed in active sync`;

code = code.replace(regexWhileEnd, replacementWhileEnd);
fs.writeFileSync('server.ts', code);
console.log("Patched while end!");
