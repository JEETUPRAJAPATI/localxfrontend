// Safe Web Vitals Reporter - prevents 'self is not defined' errors on server
import { useEffect } from 'react';

const SafeWebVitalsReporter = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Dynamic import to prevent server-side issues
    const loadWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
        
        // Report Core Web Vitals
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      } catch (error) {
        console.warn('Web Vitals could not be loaded:', error);
      }
    };

    // Load after initial render
    const timer = setTimeout(loadWebVitals, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
};

export default SafeWebVitalsReporter;