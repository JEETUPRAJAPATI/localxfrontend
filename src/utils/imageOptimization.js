/**
 * Image Optimization Utilities
 * Handles image loading, caching, and performance optimization
 * Server-safe implementation
 */

// Image cache to prevent duplicate requests (server-safe)
const imageCache = typeof Map !== 'undefined' ? new Map() : {};
const failedImages = typeof Set !== 'undefined' ? new Set() : {};

/**
 * Preload critical images to improve performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {Object} options - Preload options
 */
export const preloadImages = (imageUrls, options = {}) => {
  const { timeout = 10000 } = options;
  
  // Server-side: Just resolve immediately
  if (typeof window === 'undefined') {
    return Promise.allSettled(
      imageUrls.map(url => {
        if (typeof Map !== 'undefined') {
          imageCache.set(url, true);
        } else {
          imageCache[url] = true;
        }
        return Promise.resolve(url);
      })
    );
  }
  
  // Client-side: Actually test image loading
  return Promise.allSettled(
    imageUrls.map(url => {
      const isCached = typeof Map !== 'undefined' ? imageCache.has(url) : imageCache[url];
      const hasFailed = typeof Set !== 'undefined' ? failedImages.has(url) : failedImages[url];
      
      if (isCached || hasFailed) {
        return Promise.resolve(url);
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        const timeoutId = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          if (typeof Set !== 'undefined') {
            failedImages.add(url);
          } else {
            failedImages[url] = true;
          }
          reject(new Error(`Image preload timeout: ${url}`));
        }, timeout);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          if (typeof Map !== 'undefined') {
            imageCache.set(url, true);
          } else {
            imageCache[url] = true;
          }
          resolve(url);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          if (typeof Set !== 'undefined') {
            failedImages.add(url);
          } else {
            failedImages[url] = true;
          }
          reject(new Error(`Image preload failed: ${url}`));
        };
        
        img.src = url;
      });
    })
  );
};

/**
 * Check if an image is cached or has failed previously
 * @param {string} url - Image URL to check
 * @returns {Object} Cache status
 */
export const getImageCacheStatus = (url) => {
  const isCached = typeof Map !== 'undefined' ? imageCache.has(url) : imageCache[url];
  const hasFailed = typeof Set !== 'undefined' ? failedImages.has(url) : failedImages[url];
  
  return {
    isCached: !!isCached,
    hasFailed: !!hasFailed,
    shouldLoad: !isCached && !hasFailed
  };
};

/**
 * Generate optimized image URLs with size parameters
 * @param {string} baseUrl - Base image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const generateOptimizedImageUrl = (baseUrl, options = {}) => {
  if (!baseUrl || typeof baseUrl !== 'string') return baseUrl;
  
  const { width, height, quality = 75, format = 'webp' } = options;
  
  // If it's already a Next.js optimized image or external URL, return as-is
  if (baseUrl.includes('/_next/image') || !baseUrl.startsWith('/')) {
    return baseUrl;
  }
  
  const params = [];
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (quality) params.push(`q=${quality}`);
  if (format) params.push(`f=${format}`);
  
  const queryString = params.join('&');
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Validate image URL and provide fallback
 * @param {string} url - Image URL to validate
 * @param {string} fallback - Fallback URL
 * @returns {string} Valid image URL
 */
export const validateImageUrl = (url, fallback = '/images/img-placeholder.jpg') => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  
  // Check if URL is malformed
  try {
    if (url.startsWith('http')) {
      new URL(url);
    }
    return url;
  } catch (error) {
    console.warn(`Invalid image URL: ${url}`, error);
    return fallback;
  }
};

/**
 * Generate responsive image sizes string
 * @param {Object} breakpoints - Responsive breakpoints
 * @returns {string} Sizes string for Next.js Image
 */
export const generateResponsiveSizes = (breakpoints = {}) => {
  const defaultBreakpoints = {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '33vw',
    ...breakpoints
  };
  
  return Object.values(defaultBreakpoints).join(', ');
};

/**
 * Clear image cache (useful for memory management)
 */
export const clearImageCache = () => {
  if (typeof Map !== 'undefined') {
    imageCache.clear();
    failedImages.clear();
  } else {
    Object.keys(imageCache).forEach(key => delete imageCache[key]);
    Object.keys(failedImages).forEach(key => delete failedImages[key]);
  }
  console.log('Image cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  const cachedCount = typeof Map !== 'undefined' ? imageCache.size : Object.keys(imageCache).length;
  const failedCount = typeof Set !== 'undefined' ? failedImages.size : Object.keys(failedImages).length;
  
  return {
    cachedImages: cachedCount,
    failedImages: failedCount,
    totalTracked: cachedCount + failedCount
  };
};

/**
 * Image loading strategies for different content types
 */
export const LOADING_STRATEGIES = {
  HERO: { priority: true, quality: 90, sizes: '100vw' },
  THUMBNAIL: { priority: false, quality: 75, sizes: '(max-width: 768px) 50vw, 25vw' },
  GALLERY: { priority: false, quality: 80, sizes: '(max-width: 768px) 100vw, 50vw' },
  AVATAR: { priority: false, quality: 75, sizes: '64px' },
  ICON: { priority: false, quality: 75, sizes: '32px' }
};

/**
 * Apply loading strategy to image props
 * @param {string} strategy - Loading strategy name
 * @param {Object} imageProps - Base image props
 * @returns {Object} Enhanced image props
 */
export const applyLoadingStrategy = (strategy, imageProps = {}) => {
  const strategyConfig = LOADING_STRATEGIES[strategy] || LOADING_STRATEGIES.THUMBNAIL;
  
  return {
    ...imageProps,
    ...strategyConfig,
    // Don't override if already specified
    priority: imageProps.priority !== undefined ? imageProps.priority : strategyConfig.priority,
    quality: imageProps.quality !== undefined ? imageProps.quality : strategyConfig.quality,
    sizes: imageProps.sizes !== undefined ? imageProps.sizes : strategyConfig.sizes,
  };
};