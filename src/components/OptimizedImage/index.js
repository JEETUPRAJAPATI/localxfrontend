import { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';

const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  quality = 75,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.webp',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoading(false);
          observer.unobserve(img);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (event) => {
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (event) => {
    setHasError(true);
    setImageSrc(fallbackSrc);
    setIsLoading(false);
    onError?.(event);
  };

  // Generate optimized src for different formats
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    // Check if it's already optimized or external
    if (originalSrc.includes('webp') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Convert to WebP if supported
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  const optimizedSrc = getOptimizedSrc(imageSrc);

  // Blur data URL for placeholder
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  if (priority || !isLoading) {
    return (
      <div ref={imgRef} className={`optimized-image-container ${className}`}>
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          quality={quality}
          loading={loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${hasError ? 'error' : ''}`}
          {...props}
        />
        {isLoading && (
          <div className="image-loading-overlay">
            <div className="image-skeleton"></div>
          </div>
        )}
      </div>
    );
  }

  // Placeholder while not in viewport
  return (
    <div 
      ref={imgRef} 
      className={`optimized-image-placeholder ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="placeholder-content">Loading...</div>
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// CSS for the component (to be added to global styles)
export const optimizedImageStyles = `
.optimized-image-container {
  position: relative;
  overflow: hidden;
}

.optimized-image {
  transition: opacity 0.3s ease;
}

.optimized-image.error {
  filter: grayscale(100%) opacity(0.5);
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.optimized-image-placeholder {
  background: linear-gradient(
    90deg,
    #f8f9fa 25%,
    #e9ecef 50%,
    #f8f9fa 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.placeholder-content {
  color: #6c757d;
  font-size: 0.875rem;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive image optimization */
@media (max-width: 576px) {
  .optimized-image-container {
    max-width: 100%;
  }
}

/* Prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .image-skeleton,
  .optimized-image-placeholder,
  .optimized-image {
    animation: none;
    transition: none;
  }
}
`;

export default OptimizedImage;