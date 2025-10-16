// API Route: /api/v1/home/dashboardContent
// This proxies requests to the external API server

import { getHomeDashboardContentAPI } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/dashboardContent');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get dashboard content data from external API
    const dashboardContentData = await getHomeDashboardContentAPI();
    
    console.log('✅ API Success: GET /api/v1/home/dashboardContent - Status: 200');
    console.log('📊 Dashboard Content Data:', typeof dashboardContentData, '- Length:', dashboardContentData?.length || 0);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(dashboardContentData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/dashboardContent -', error.message);
    
    // Return fallback data
    const fallbackData = '<h1>Find here male and Female Escorts Online</h1><p>Welcome to LocalXList - your platform for connections.</p>';
    
    return res.status(200).json(fallbackData);
  }
}