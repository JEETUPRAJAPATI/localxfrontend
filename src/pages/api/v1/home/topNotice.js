// API Route: /api/v1/home/topNotice
// This proxies requests to the external API server

import { getHomeTopNoticeAPI } from '../../../../api/apiService.server';

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/home/topNotice');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get top notice data from external API
    const topNoticeData = await getHomeTopNoticeAPI();
    
    console.log('✅ API Success: GET /api/v1/home/topNotice - Status: 200');
    console.log('📊 Top Notice Data:', typeof topNoticeData, '- Length:', topNoticeData?.length || 0);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(topNoticeData);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/home/topNotice -', error.message);
    
    // Return fallback data
    const fallbackData = '<p>Localxlist.org is a Free casual dating and personal classified website.</p>';
    
    return res.status(200).json(fallbackData);
  }
}