const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Undo the bad patch
const badEnd = `      syncedProductNames.add(name);
          
          }));
        }`;
const originalEnd = `      syncedProductNames.add(name);
          
        }`;

code = code.replace(badEnd, originalEnd);

// Add the correct closing
const targetTrueEnd = `             if (updateError) console.error("Update error:", updateError.message);
             else updatedCount++;
          }
        }
      }`;

const newTrueEnd = `             if (updateError) console.error("Update error:", updateError.message);
             else updatedCount++;
          }
          })); // close Promise.all
        }
      }`;

code = code.replace(targetTrueEnd, newTrueEnd);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts braces");
