// API Route: /api/v1/home/sponsers
// This proxies requests to the external API server

import { getSponsersData } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/sponsers');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get sponsers data from external API
    const sponsersData = await getSponsersData();
    
    console.log('✅ API Success: GET /api/v1/home/sponsers - Status: 200');
    console.log('📊 Sponsers Data:', typeof sponsersData, '- Items:', sponsersData?.data?.length || 0);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(sponsersData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/sponsers -', error.message);
    
    // Return fallback data
    const fallbackData = {
      heading: 'Sponsored Websites',
      data: [
        {
          id: 1,
          title: 'Example Sponsor',
          url: 'https://example.com',
          logo: '/images/img-placeholder.jpg'
        }
      ]
    };
    
    return res.status(200).json(fallbackData);
  }
}