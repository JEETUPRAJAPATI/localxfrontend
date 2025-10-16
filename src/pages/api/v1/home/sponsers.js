// API Route: /api/v1/home/sponsers
// This proxies requests to the external API server

import { getHomeSponsersAPI } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    const { deviceWidth } = req.query;
    console.log('🔄 API Request: GET /api/v1/home/sponsers', deviceWidth ? `- deviceWidth: ${deviceWidth}` : '');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get sponsers data from external API
    const sponsersData = await getHomeSponsersAPI();
    
    // Apply responsive filtering based on deviceWidth
    let processedData = sponsersData;
    if (deviceWidth && sponsersData?.data) {
      const width = parseInt(deviceWidth);
      
      // Adjust data based on device width for responsive design
      if (width <= 768) {
        // Mobile: Show fewer items, smaller images
        processedData = {
          ...sponsersData,
          data: sponsersData.data.slice(0, 12).map(item => ({
            ...item,
            displaySize: 'small',
            priority: item.id <= 6 ? 'high' : 'low'
          }))
        };
      } else if (width <= 1024) {
        // Tablet: Show medium amount
        processedData = {
          ...sponsersData,
          data: sponsersData.data.slice(0, 20).map(item => ({
            ...item,
            displaySize: 'medium',
            priority: item.id <= 10 ? 'high' : 'low'
          }))
        };
      } else {
        // Desktop: Show all items
        processedData = {
          ...sponsersData,
          data: sponsersData.data.map(item => ({
            ...item,
            displaySize: 'large',
            priority: item.id <= 15 ? 'high' : 'low'
          }))
        };
      }
    }
    
    console.log('✅ API Success: GET /api/v1/home/sponsers - Status: 200');
    console.log('📊 Sponsers Data:', typeof processedData, '- Items:', processedData?.data?.length || 0);
    console.log('📱 Device Width:', deviceWidth || 'not specified');
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(processedData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/sponsers -', error.message);
    
    // Return fallback data with responsive consideration
    const { deviceWidth } = req.query;
    const width = parseInt(deviceWidth) || 1920;
    
    const baseItems = [
      {
        id: 1,
        title: 'Example Sponsor',
        url: 'https://example.com',
        logo: '/images/img-placeholder.jpg',
        displaySize: width <= 768 ? 'small' : width <= 1024 ? 'medium' : 'large',
        priority: 'high'
      }
    ];
    
    const fallbackData = {
      heading: 'Sponsored Websites',
      data: baseItems,
      deviceWidth: width,
      responsive: true
    };
    
    return res.status(200).json(fallbackData);
  }
}