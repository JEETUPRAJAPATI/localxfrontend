// API Route: /api/v1/home/countriesV2
// This proxies requests to the external API server

import { getHomeCountriesV2API } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/countriesV2');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get countries data from external API
    const countriesData = await getHomeCountriesV2API();
    
    console.log('✅ API Success: GET /api/v1/home/countriesV2 - Status: 200');
    console.log('📊 Countries Data:', typeof countriesData, '- Items:', countriesData?.list?.length || 0);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(countriesData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/countriesV2 -', error.message);
    
    // Return fallback data
    const fallbackData = {
      list: [
        {
          id: 1,
          country: 'United States',
          cities: [
            { id: 1, city: 'New York', subCities: [] },
            { id: 2, city: 'Los Angeles', subCities: [] }
          ]
        }
      ],
      hasMoreCountries: false,
      countryPagination: { totalPages: 1, currentPage: 1, nextPage: null }
    };
    
    return res.status(200).json(fallbackData);
  }
}