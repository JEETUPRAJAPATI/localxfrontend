import { memo, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Optimized component to reduce DOM elements and improve performance
const OptimizedRenderer = memo(({ 
  items, 
  renderItem, 
  maxVisibleItems = 20, 
  enableVirtualization = false,
  className = ''
}) => {
  // Use virtualization for large lists to reduce DOM size
  const processedItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    
    // Limit visible items to reduce DOM size
    const limitedItems = enableVirtualization 
      ? items.slice(0, maxVisibleItems)
      : items;
    
    return limitedItems;
  }, [items, maxVisibleItems, enableVirtualization]);

  // Memoize the rendered list to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return processedItems.map((item, index) => {
      const key = item.id || item._id || `item-${index}`;
      return (
        <div key={key} className="optimized-item">
          {renderItem(item, index)}
        </div>
      );
    });
  }, [processedItems, renderItem]);

  return (
    <div className={`optimized-renderer ${className}`}>
      {renderedItems}
      {enableVirtualization && items.length > maxVisibleItems && (
        <div className="load-more-indicator">
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              // Implement load more functionality
              console.log('Load more items');
            }}
          >
            Load More ({items.length - maxVisibleItems} remaining)
          </button>
        </div>
      )}
    </div>
  );
});

OptimizedRenderer.displayName = 'OptimizedRenderer';

// Dynamically import heavy components to reduce initial bundle size
export const LazyTinyMCE = dynamic(
  () => import('@tinymce/tinymce-react').then(mod => ({ default: mod.Editor })),
  {
    ssr: false,
    loading: () => <div className="editor-loading">Loading editor...</div>
  }
);

export const LazyRecaptcha = dynamic(
  () => import('react-google-recaptcha'),
  {
    ssr: false,
    loading: () => <div className="recaptcha-loading">Loading security check...</div>
  }
);

export const LazyReactPlayer = dynamic(
  () => import('react-player'),
  {
    ssr: false,
    loading: () => <div className="player-loading">Loading player...</div>
  }
);

export const LazyLightbox = dynamic(
  () => import('yet-another-react-lightbox'),
  {
    ssr: false,
    loading: () => <div className="lightbox-loading">Loading gallery...</div>
  }
);

// Performance monitoring hook - optimized to not block main thread
export const usePerformanceMonitor = () => {
  const measurePerformance = (name, fn) => {
    return (...args) => {
      if (typeof window !== 'undefined' && window.performance) {
        const start = window.performance.now();
        const result = fn(...args);
        const end = window.performance.now();
        
        // Only log in development - non-blocking
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => console.log(`${name} took ${end - start} milliseconds`), 0);
        }
        
        return result;
      }
      return fn(...args);
    };
  };

  const trackWebVitals = (metric) => {
    // Track Core Web Vitals - non-blocking
    if (metric.label === 'web-vital') {
      setTimeout(() => {
        console.log(metric);
        
        // Send to analytics in production - non-blocking
        if (process.env.NODE_ENV === 'production') {
          // Implement analytics tracking here
          // Example: gtag('event', metric.name, { value: metric.value });
        }
      }, 0);
    }
  };

  return { measurePerformance, trackWebVitals };
};

// Separate Performance Monitor component - non-blocking
export const PerformanceMonitor = memo(() => {
  const { trackWebVitals } = usePerformanceMonitor();

  useEffect(() => {
    // Track Core Web Vitals - deferred to avoid blocking
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(trackWebVitals);
          getFID(trackWebVitals);
          getFCP(trackWebVitals);
          getLCP(trackWebVitals);
          getTTFB(trackWebVitals);
        });
      }, 1000); // Defer by 1 second
    }

    // DOM optimization on load - deferred
    const timer = setTimeout(() => {
      optimizeDOM.cleanupDOM();
    }, 2000); // Defer by 2 seconds

    return () => clearTimeout(timer);
  }, [trackWebVitals]);

  return null;
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

// DOM optimization utilities
export const optimizeDOM = {
  // Debounce function to reduce excessive re-renders
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  },

  // Reduce DOM complexity by removing unnecessary elements - non-blocking
  cleanupDOM: () => {
    if (typeof window === 'undefined') return;
    
    // Use requestIdleCallback to avoid blocking main thread
    const cleanup = () => {
      // Remove empty elements
      const emptyElements = document.querySelectorAll('div:empty, span:empty');
      emptyElements.forEach(el => {
        if (el.children.length === 0 && el.textContent.trim() === '') {
          el.remove();
        }
      });

      // Remove duplicate CSS classes
      const elements = document.querySelectorAll('*[class]');
      elements.forEach(el => {
        const classes = [...new Set(el.className.split(' '))];
        el.className = classes.join(' ');
      });
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(cleanup);
    } else {
      setTimeout(cleanup, 0);
    }
  }
};

export default OptimizedRenderer;