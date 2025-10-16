import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorPage from '@/components/ErrorBoundary/ErrorPage';
import { ThemeProvider } from '@/context/ThemeContext';
import { wrapper } from '@/store';
import Head from 'next/head';
import { Suspense, useEffect, lazy } from 'react';
import { Provider } from 'react-redux';
import { ubuntu, berkshireSwash } from '@/utils/fonts';

// Critical styles only - defer non-critical styles
import '@/styles/main.scss';
import '@/styles/global.scss';

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Lazy load non-critical components - client-side only
const LazyStyleLoader = lazy(() => import('@/components/LazyStyleLoader'));
const PerformanceMonitor = typeof window !== 'undefined' 
  ? lazy(() => import('@/components/PerformanceOptimizer').then(mod => ({ default: mod.PerformanceMonitor })))
  : () => null;

// Minimal loading component
const MinimalLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '14px',
    color: '#666'
  }}>
    Loading...
  </div>
);

function MyApp({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  
  useEffect(() => {
    // Optimize performance on client side - non-blocking
    if (typeof window !== 'undefined') {
      // Remove loading states after hydration
      document.body.style.removeProperty('visibility');
      
      // Preload critical resources - defer to avoid blocking
      setTimeout(() => {
        const preloadLinks = [
          '/images/logo.webp',
          '/images/favicon.ico'
        ];
        
        preloadLinks.forEach(href => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = href;
          link.as = href.includes('.css') ? 'style' : 'image';
          document.head.appendChild(link);
        });
      }, 100);
    }
  }, []);

  return (
    <div className={`${ubuntu.variable} ${berkshireSwash.variable}`}>
      <GoogleOAuthProvider clientId={clientId}>
        <ThemeProvider>
          <Provider store={store}>
            <ErrorBoundary fallback={<ErrorPage />}>
              <Suspense fallback={<MinimalLoader />}>
                <Head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  {/* Preconnect to external domains */}
                  <link rel="preconnect" href="https://fonts.googleapis.com" />
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                  <link rel="preconnect" href="https://api.localxlist.net" />
                  
                  {/* Resource hints */}
                  <link rel="dns-prefetch" href="//www.google.com" />
                  <link rel="dns-prefetch" href="//www.gstatic.com" />
                  
                  {/* Performance optimizations */}
                  <meta name="theme-color" content="#ffffff" />
                  <meta name="color-scheme" content="light dark" />
                </Head>
                <Component {...props.pageProps} />
                {typeof window !== 'undefined' && (
                  <Suspense fallback={null}>
                    <LazyStyleLoader />
                    <PerformanceMonitor />
                  </Suspense>
                )}
              </Suspense>
            </ErrorBoundary>
          </Provider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

// Web Vitals reporting - client-side only, defer to avoid blocking
export function reportWebVitals(metric) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Log or send to analytics - non-blocking
    setTimeout(() => console.log(metric), 0);
  }
}

export default MyApp;