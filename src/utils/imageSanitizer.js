/**
 * Image URL Sanitizer and Validator
 * Prevents malformed URLs from causing infinite loops
 */

/**
 * Sanitize and validate image URLs to prevent infinite loops
 * @param {string} url - The image URL to sanitize
 * @param {string} fallbackUrl - Fallback URL if sanitization fails
 * @returns {string} - Sanitized URL or fallback
 */
export const sanitizeImageUrl = (url, fallbackUrl = '/images/img-placeholder.jpg') => {
  // Return fallback for invalid inputs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallbackUrl;
  }

  // Clean the URL
  let cleanUrl = url.trim();

  // Check for dangerous patterns that cause infinite loops
  const dangerousPatterns = [
    /undefined/i,
    /null/i,
    /%2Fundefined/i,
    /%2Fnull/i,
    /\/undefined/,
    /\/null/,
    /\[object\s+Object\]/i,
    /\[object\s+\w+\]/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanUrl)) {
      console.warn(`Malformed image URL detected: ${cleanUrl}`);
      return fallbackUrl;
    }
  }

  // Check for excessive URL encoding
  if (cleanUrl.includes('%2F%2F') || (cleanUrl.match(/%/g) || []).length > 10) {
    console.warn(`Over-encoded URL detected: ${cleanUrl}`);
    return fallbackUrl;
  }

  // Validate URL structure for external URLs
  if (cleanUrl.startsWith('http')) {
    try {
      const urlObj = new URL(cleanUrl);
      // Check for suspicious hostnames
      if (urlObj.hostname.includes('undefined') || urlObj.hostname.includes('null')) {
        console.warn(`Invalid hostname in URL: ${cleanUrl}`);
        return fallbackUrl;
      }
      return cleanUrl;
    } catch (error) {
      console.warn(`Invalid URL structure: ${cleanUrl}`, error.message);
      return fallbackUrl;
    }
  }

  // For relative URLs, ensure they start with /
  if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
    cleanUrl = '/' + cleanUrl;
  }

  // Final validation - ensure no dangerous characters
  if (cleanUrl.includes('<') || cleanUrl.includes('>') || cleanUrl.includes('"')) {
    console.warn(`Potentially dangerous characters in URL: ${cleanUrl}`);
    return fallbackUrl;
  }

  return cleanUrl;
};

/**
 * Batch sanitize multiple image URLs
 * @param {Array} urls - Array of URLs to sanitize
 * @param {string} fallbackUrl - Fallback URL
 * @returns {Array} - Array of sanitized URLs
 */
export const sanitizeImageUrls = (urls, fallbackUrl = '/images/img-placeholder.jpg') => {
  if (!Array.isArray(urls)) {
    return [];
  }

  return urls.map(url => sanitizeImageUrl(url, fallbackUrl));
};

/**
 * Validate image file extension
 * @param {string} url - Image URL
 * @returns {boolean} - True if valid image extension
 */
export const hasValidImageExtension = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const urlLower = url.toLowerCase();
  
  // Check if URL contains query parameters
  const cleanUrl = urlLower.split('?')[0];
  
  return validExtensions.some(ext => cleanUrl.endsWith(ext));
};

/**
 * Generate a safe image URL with validation
 * @param {Object} options - Image options
 * @returns {string} - Safe image URL
 */
export const generateSafeImageUrl = ({ 
  src, 
  fallback = '/images/img-placeholder.jpg',
  requireValidExtension = false 
}) => {
  const sanitized = sanitizeImageUrl(src, fallback);
  
  if (requireValidExtension && !hasValidImageExtension(sanitized)) {
    console.warn(`Invalid image extension: ${sanitized}`);
    return fallback;
  }
  
  return sanitized;
};