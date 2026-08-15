import fs from 'fs';
const path = 'c:/Users/ASUS/Downloads/antigravity/public/sitemap.xml';
let xml = fs.readFileSync(path, 'utf8');

// Ensure clean <?xml version="1.0" encoding="UTF-8"?> at line 1
xml = xml.replace(/^[^\n]*/, '<?xml version="1.0" encoding="UTF-8"?>');

fs.writeFileSync(path, xml, 'utf8');
console.log('Fixed sitemap header successfully!');
