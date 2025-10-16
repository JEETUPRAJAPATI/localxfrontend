import { useState, useEffect } from 'react';

const useDeviceSize = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isDesktop: width > 1024,
    isTablet: width > 768 && width <= 1024,
    isMobile: width <= 768,
  };
};

export default useDeviceSize;
