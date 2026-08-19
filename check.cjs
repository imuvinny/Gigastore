const https = require('https');
https.get('https://qiiqvglngqigktyxyiwo.supabase.co/storage/v1/object/public/images/0.23978134941293594.png', (res) => {
  console.log('Status Code:', res.statusCode);
});
