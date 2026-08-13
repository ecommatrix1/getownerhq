const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'ydmrupmxtyyecykpxitb.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_Mt6ZI4t0oJrto5x1uu6RvQ_GhTnZOK-'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('openapi.json', data);
    console.log('done');
  });
});
req.end();
