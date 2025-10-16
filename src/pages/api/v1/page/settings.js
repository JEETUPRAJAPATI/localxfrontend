// API Route: /api/v1/page/settings
// This provides page settings and configuration

export default async function handler(req, res) {
  try {
    console.log('🔄 API Request: GET /api/v1/page/settings');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Provide static page settings using local logo
    const pageSettings = {
      siteName: 'LocalXList',
      headerLogo: '/images/logo.png', // Use local static logo
      footerLogo: '/images/logo.png', // Use local static logo
      favicon: '/images/favicon.ico',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
      apiUrl: process.env.NEXT_PUBLIC_API_URI || 'http://localhost:3001',
      theme: {
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        backgroundColor: '#ffffff',
        textColor: '#212529'
      },
      navigation: {
        showSearch: true,
        showUserMenu: true,
        showLanguageSelector: false
      },
      seo: {
        metaTitle: 'Find Escorts Near you Online - Casual Dating | Localxlist',
        metaDescription: 'Localxlist is a free platform to find female and male escorts near you.',
        metaKeywords: 'local escorts,escort sites,escort website',
        ogImage: '/images/logo.png' // Use local static logo
      },
      contact: {
        email: 'contact@localxlist.net',
        phone: '+1-555-0123',
        address: 'United States'
      },
      features: {
        userRegistration: true,
        postCreation: true,
        messaging: true,
        premiumFeatures: true
      }
    };
    
    console.log('✅ API Success: GET /api/v1/page/settings - Status: 200');
    console.log('📊 Page Settings:', typeof pageSettings, '- siteName:', pageSettings.siteName);
    
    // Set headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(pageSettings);
    
  } catch (error) {
    console.error('❌ API Error: GET /api/v1/page/settings -', error.message);
    
    // Return minimal fallback settings
    const fallbackSettings = {
      siteName: 'LocalXList',
      headerLogo: '/images/logo.png',
      footerLogo: '/images/logo.png',
      favicon: '/images/favicon.ico'
    };
    
    return res.status(200).json(fallbackSettings);
  }
}