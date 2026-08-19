const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
`        return res.status(response.status || 400).json({
          success: false,
          error: data.message || "Lenco payment initiation failed",
          details: data
        });`,
`        let errorMsg = data.message || "Lenco payment initiation failed";
        if (typeof data.message === 'object') {
            errorMsg = JSON.stringify(data.message);
        } else if (data.errors || data.errorCode) {
            errorMsg += " (ErrorCode: " + data.errorCode + ")";
        }
        return res.status(response.status || 400).json({
          success: false,
          error: errorMsg,
          details: data
        });`);
fs.writeFileSync('server.ts', code);
