import { useEffect } from 'react';

const LazyStyleLoader = () => {
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    // Enable non-critical styles after initial render
    const enableNonCriticalStyles = () => {
      // Add a class to enable non-critical styles
      document.documentElement.classList.add('non-critical-styles-loaded');
    };

    // Load after a short delay to not block initial render
    const timer = setTimeout(enableNonCriticalStyles, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default LazyStyleLoader;
