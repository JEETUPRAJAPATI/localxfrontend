import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window?.scrollTo(0, 0);
    };

    scrollToTop();
  }, [pathname]);
};

export default useScrollToTop;
