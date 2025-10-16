import { getPartnerSitesMapAPI } from "@/api/apiService";

// // Generate sitemap
const generateSitemap = async () => {
    const { urls } = await getPartnerSitesMapAPI();
    const allUrls = urls;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
            .map((url) => {
                const priority = '0.6';
                const changefreq = 'weekly';
                return `<url>
          <loc>${process.env.NEXT_PUBLIC_SITE_URL}${url}</loc>
          <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
          <changefreq>${changefreq}</changefreq>
          <priority>${priority}</priority>
        </url>
      `;
            }).join('')}
</urlset>`;
    return sitemap;
};

export async function getServerSideProps({ res }) {
    try {
        // Generate XML
        const sitemap = await generateSitemap();
        // Set response headers
        res.setHeader('Content-Type', 'text/xml');
        res.write(sitemap);
        res.end();

        return { props: {} };
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.statusCode = 500;
        res.end();
        return { props: {} };
    }
}

export default function PartnersSitemap() {
    // Empty component (XML handled in getServerSideProps)
}