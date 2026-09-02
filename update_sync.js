const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// We need to replace the while loop body and the DB operations
// But it's easier to just read the whole app.post('/api/sync') and replace it.
