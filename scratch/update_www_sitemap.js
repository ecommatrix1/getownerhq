import fs from 'fs';
const path = 'c:/Users/ASUS/Downloads/antigravity/public/sitemap.xml';

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.getownerhq.in/</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/signup</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/login</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/about</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/terms</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/privacy</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/refund</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/compare</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/compare/gymowl-alternative</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/compare/getownerhq-vs-gymmaster</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.getownerhq.in/compare/getownerhq-vs-wodify</loc>
    <lastmod>2026-08-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

fs.writeFileSync(path, sitemapContent, 'utf8');
console.log('Successfully updated sitemap.xml to www.getownerhq.in canonical URLs!');
