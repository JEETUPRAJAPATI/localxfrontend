// pages/sitemap.xml.js
export default function Sitemap() {
  // Empty component (XML handled in getServerSideProps)
}
export async function getServerSideProps({ res }) {
  // Generate sitemap index that points to individual sitemap files
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       <sitemap>
          <loc>${process.env.NEXT_PUBLIC_SITE_URL}/sitemap-pages.xml</loc>
        </sitemap>
        <sitemap>
          <loc>${process.env.NEXT_PUBLIC_SITE_URL}/sitemap-categories.xml</loc>
        </sitemap>       
         <sitemap>
          <loc>${process.env.NEXT_PUBLIC_SITE_URL}/sitemap-partners.xml</loc>
        </sitemap>       
         ${Array.from({ length: 50 }, (_, i) => `
          <sitemap>
            <loc>${process.env.NEXT_PUBLIC_SITE_URL}/sitemap-posts-${i + 1}.xml</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
          </sitemap>
        `).join('')}
        <!-- Add more post sitemaps as needed -->
      </sitemapindex>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemapIndex);
  res.end();
  return { props: {} };
}