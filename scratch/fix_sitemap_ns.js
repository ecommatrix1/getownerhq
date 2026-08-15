import fs from 'fs';
const path = 'c:/Users/ASUS/Downloads/antigravity/public/sitemap.xml';
let xml = fs.readFileSync(path, 'utf8');

// Fix namespace typo: http://www.sitemap.org -> http://www.sitemaps.org
xml = xml.replace('http://www.sitemap.org/schemas/sitemap/0.9', 'http://www.sitemaps.org/schemas/sitemap/0.9');

fs.writeFileSync(path, xml, 'utf8');
console.log('Fixed sitemaps.org namespace typo successfully!');
