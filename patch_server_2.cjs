const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
`        let errorMsg = data.message || "Lenco payment initiation failed";
        if (typeof data.message === 'object') {
            errorMsg = JSON.stringify(data.message);
        } else if (data.errors || data.errorCode) {
            errorMsg += " (ErrorCode: " + data.errorCode + ")";
        }`,
`        let errorMsg = data.message || "Lenco payment initiation failed";
        if (typeof data.message === 'object') {
            errorMsg = JSON.stringify(data.message);
        }
        if (data.errors && Array.isArray(data.errors)) {
            errorMsg += " - " + data.errors.map(e => \`\${e.message || ''} (Code: \${e.errorCode || ''})\`).join(', ');
        } else if (data.errorCode) {
            errorMsg += " (ErrorCode: " + data.errorCode + ")";
        }`);
fs.writeFileSync('server.ts', code);
