// API Route: /api/v1/home/seo
// This proxies requests to the external API server

import { getHomeSEOAPI } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/seo');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get SEO data from external API
    const seoData = await getHomeSEOAPI();
    
    console.log('✅ API Success: GET /api/v1/home/seo - Status: 200');
    console.log('📊 SEO Data:', typeof seoData, '- Has title:', !!seoData?.title);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(seoData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/seo -', error.message);
    
    // Return fallback data
    const fallbackData = {
      title: 'Find Escorts Near you Online - Casual Dating | Localxlist',
      description: 'Localxlist is a free platform to find female and male escorts near you. Explore casual dating and massage services online.',
      keywords: 'local escorts,escort sites,escort website',
      robots: 'index, follow',
      ogTitle: 'Find Escorts Near you Online | Localxlist',
      ogDescription: 'Localxlist is a free platform to find female and male escorts near you.',
      ogImage: '/images/logo.png', // Use local static logo
      ogSiteName: 'localxlist',
      ogType: 'website',
      ogUrl: 'https://localxlist.net',
      image: '/images/logo.png', // Use local static logo
      favicon: '/images/favicon.ico',
      author: 'Localxlist.net'
    };
    
    return res.status(200).json(fallbackData);
  }
}