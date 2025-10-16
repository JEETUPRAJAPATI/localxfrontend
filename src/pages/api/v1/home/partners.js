// API Route: /api/v1/home/partners
// This proxies requests to the external API server

import { getPartnersData } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/partners');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get partners data from external API
    const partnersData = await getPartnersData();
    
    console.log('✅ API Success: GET /api/v1/home/partners - Status: 200');
    console.log('📊 Partners Data:', Array.isArray(partnersData) ? `Array with ${partnersData.length} items` : typeof partnersData);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(partnersData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/partners -', error.message);
    
    // Return fallback data
    const fallbackData = [
      {
        id: 1,
        category: 'Featured Partners',
        siteLinks: [
          {
            id: 1,
            title: 'Partner Site 1',
            url: 'https://example.com',
            logo: '/images/img-placeholder.jpg'
          }
        ]
      }
    ];
    
    return res.status(200).json(fallbackData);
  }
}