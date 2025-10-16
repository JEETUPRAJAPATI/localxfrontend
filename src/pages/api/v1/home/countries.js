// API Route: /api/v1/home/countries
// This provides country data (different from countriesV2)

import { getCountriesData } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/countries');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get countries data from external API
    const countriesData = await getCountriesData();
    
    console.log('✅ API Success: GET /api/v1/home/countries - Status: 200');
    console.log('📊 Countries Data:', typeof countriesData, '- Items:', countriesData?.list?.length || 0);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(countriesData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/countries -', error.message);
    
    // Return fallback data
    const fallbackData = {
      countries: [
        {
          id: 1,
          name: 'United States',
          slug: 'united-states',
          cities: [
            { id: 1, name: 'New York', slug: 'new-york' },
            { id: 2, name: 'Los Angeles', slug: 'los-angeles' }
          ]
        },
        {
          id: 2,
          name: 'Canada',
          slug: 'canada',
          cities: [
            { id: 3, name: 'Toronto', slug: 'toronto' },
            { id: 4, name: 'Vancouver', slug: 'vancouver' }
          ]
        }
      ],
      total: 2
    };
    
    return res.status(200).json(fallbackData);
  }
}