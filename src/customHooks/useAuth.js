import { isLogin } from '@/utils/auth';
import { useCallback, useEffect, useState } from 'react';

const useAuth = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    const tokenValid = Boolean(isLogin());
    setIsAuthenticated(tokenValid);
    setIsLoading(false);
  }, []); // ✅ No need to include `isLogin`, since it's a function

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading };
};

export default useAuth;
