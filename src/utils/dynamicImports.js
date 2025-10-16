// Dynamic import utilities for code splitting and performance optimization

import dynamic from 'next/dynamic';
import React, { lazy, Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Loading components
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center p-4">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const LoadingPlaceholder = ({ height = '200px' }) => (
  <div 
    className="bg-light rounded d-flex justify-content-center align-items-center"
    style={{ height, minHeight: height }}
  >
    <div className="text-muted">Loading...</div>
  </div>
);

// Dynamically imported components with optimized loading
export const DynamicComponents = {
  // Heavy third-party components
  TinyMCE: dynamic(() => import('@tinymce/tinymce-react').then(mod => ({ default: mod.Editor })), {
    ssr: false,
    loading: () => <LoadingPlaceholder height="300px" />
  }),

  ReactPlayer: dynamic(() => import('react-player'), {
    ssr: false,
    loading: () => <LoadingPlaceholder height="250px" />
  }),

  Recaptcha: dynamic(() => import('react-google-recaptcha'), {
    ssr: false,
    loading: () => <LoadingPlaceholder height="78px" />
  }),

  Lightbox: dynamic(() => import('yet-another-react-lightbox'), {
    ssr: false,
    loading: () => <LoadingPlaceholder />
  }),

  // User dashboard components (loaded only when needed)
  UserDashboard: dynamic(() => import('@/components/UserDashboard'), {
    loading: () => <LoadingSpinner />
  }),

  UserCreatePost: dynamic(() => import('@/components/UserCreatePost'), {
    loading: () => <LoadingSpinner />
  }),

  UserPostEdit: dynamic(() => import('@/components/UserPostEdit'), {
    loading: () => <LoadingSpinner />
  }),

  UserRechargeBalance: dynamic(() => import('@/components/UserRechargeBalance'), {
    loading: () => <LoadingSpinner />
  }),

  // Partner components
  PartnerList: dynamic(() => import('@/components/PartnerList'), {
    loading: () => <LoadingSpinner />
  }),

  PartnerCategories: dynamic(() => import('@/components/PartnerCategories'), {
    loading: () => <LoadingSpinner />
  }),

  // Blog components
  Blogs: dynamic(() => import('@/components/Blogs'), {
    loading: () => <LoadingSpinner />
  }),

  PostDetail: dynamic(() => import('@/components/PostDetail'), {
    loading: () => <LoadingSpinner />
  }),

  // Authentication components
  Login: dynamic(() => import('@/components/Login'), {
    loading: () => <LoadingSpinner />
  }),

  Signup: dynamic(() => import('@/components/Signup'), {
    loading: () => <LoadingSpinner />
  }),

  ForgotPassword: dynamic(() => import('@/components/ForgotPassword'), {
    loading: () => <LoadingSpinner />
  }),

  // Search and filter components
  SearchSites: dynamic(() => import('@/components/SearchSites'), {
    loading: () => <LoadingSpinner />
  }),

  // Image components
  ImageCroppie: dynamic(() => import('@/components/ImageCroppie'), {
    ssr: false,
    loading: () => <LoadingPlaceholder height="400px" />
  }),

  ThumbnailCarousel: dynamic(() => import('@/components/ThumbnailCarousel'), {
    loading: () => <LoadingSpinner />
  }),

  // Ad components
  AdsCarousel: dynamic(() => import('@/components/AdsCarousel'), {
    loading: () => <LoadingPlaceholder height="150px" />
  }),

  // Contact and support
  ContactUs: dynamic(() => import('@/components/ContactUs'), {
    loading: () => <LoadingSpinner />
  }),

  AboutUs: dynamic(() => import('@/components/AboutUs'), {
    loading: () => <LoadingSpinner />
  })
};

// Route-based code splitting helpers
export const RouteComponents = {
  // Home page chunks
  Home: dynamic(() => import('@/components/Home'), {
    loading: () => <LoadingSpinner />
  }),

  MobileOptimizedHome: dynamic(() => import('@/components/MobileOptimizedHome'), {
    loading: () => <LoadingSpinner />
  }),

  // Page components
  Terms: dynamic(() => import('@/components/Terms'), {
    loading: () => <LoadingSpinner />
  }),

  Friends: dynamic(() => import('@/components/Friends'), {
    loading: () => <LoadingSpinner />
  }),

  FriendSites: dynamic(() => import('@/components/FriendSites'), {
    loading: () => <LoadingSpinner />
  }),

  SponserSites: dynamic(() => import('@/components/SponserSites'), {
    loading: () => <LoadingSpinner />
  })
};

// Utility function for conditional imports
export const importWhenNeeded = (condition, importFn) => {
  if (condition) {
    return importFn();
  }
  return Promise.resolve(null);
};

// Preload critical components for better UX
export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be needed
    import('@/components/Header');
    import('@/components/Footer');
    import('@/components/Layout');
    
    // Preload based on user agent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      import('@/components/MobileOptimizedHome');
    } else {
      import('@/components/Home');
    }
  }
};

// Lazy load non-critical CSS
export const loadNonCriticalCSS = () => {
  if (typeof window !== 'undefined') {
    const loadCSS = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = function() {
        this.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Load non-critical stylesheets
    setTimeout(() => {
      loadCSS('/css/non-critical.css');
    }, 100);
  }
};

// Performance optimization wrapper
export const withPerformanceOptimization = (Component, options = {}) => {
  const {
    enableLazyLoading = true,
    enableMemoization = true,
    enableErrorBoundary = true
  } = options;

  let OptimizedComponent = Component;

  if (enableMemoization) {
    OptimizedComponent = React.memo(OptimizedComponent);
  }

  if (enableLazyLoading) {
    OptimizedComponent = lazy(() => Promise.resolve({ default: OptimizedComponent }));
  }

  if (enableErrorBoundary) {
    OptimizedComponent = (props) => (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <OptimizedComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return OptimizedComponent;
};

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    import('@next/bundle-analyzer').then(() => {
      console.log('Bundle analyzer loaded');
    });
  }
};

export default DynamicComponents;