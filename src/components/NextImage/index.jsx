import Image from "next/image";
import PropTypes from "prop-types";
import { useState, useCallback, useEffect } from "react";
import { validateImageUrl, getImageCacheStatus } from "../../utils/imageOptimization";

const NextImage = ({
  src,
  alt = "",
  width,
  height,
  aspectRatio, // Format: number (e.g., 1.777) or string (e.g., "16/9")
  defaultImage = "/images/img-placeholder.jpg",
  priority = false,
  fill = false,
  quality = 75,
  sizes = "(max-width: 768px) 100vw, 50vw",
  placeholder,
  blurDataURL,
  onLoadingComplete,
  onError,
  className = "",
  style = {},
  timeout = 10000, // 10 second timeout
  ...props
}) => {
  // State to track if we've already fallen back to default image
  const [hasErrored, setHasErrored] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => validateImageUrl(src, defaultImage));
  const [_isLoading, setIsLoading] = useState(true);

  // Check cache status
  const cacheStatus = getImageCacheStatus(src);

  // Validate src URL and set timeout
  useEffect(() => {
    const validatedSrc = validateImageUrl(src, defaultImage);
    
    if (!validatedSrc || validatedSrc === defaultImage) {
      setIsLoading(false);
      return;
    }

    // If image has failed before, use default immediately
    if (cacheStatus.hasFailed) {
      setHasErrored(true);
      setCurrentSrc(defaultImage);
      setIsLoading(false);
      return;
    }

    // Reset state when src changes
    setHasErrored(false);
    setIsLoading(true);
    setCurrentSrc(validatedSrc);

    // Set timeout for image loading
    const timeoutId = setTimeout(() => {
      console.warn(`Image loading timeout: ${validatedSrc}`);
      if (!hasErrored) {
        setHasErrored(true);
        setCurrentSrc(defaultImage);
        setIsLoading(false);
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [src, defaultImage, timeout, hasErrored, cacheStatus.hasFailed]);

  // Handle fallback image on error - PREVENT INFINITE LOOPS
  const handleError = useCallback((e) => {
    console.warn(`Image failed to load: ${currentSrc}`);
    setIsLoading(false);
    
    if (onError) onError(e);
    
    // Only fallback once to prevent infinite loops
    if (!hasErrored && currentSrc !== defaultImage) {
      console.log(`Falling back to default image: ${defaultImage}`);
      setHasErrored(true);
      setCurrentSrc(defaultImage);
    } else {
      console.error(`Default image also failed: ${defaultImage}`);
    }
  }, [currentSrc, defaultImage, hasErrored, onError]);

  // Handle successful image load
  const _handleLoadingComplete = useCallback((result) => {
    setIsLoading(false);
    if (onLoadingComplete) onLoadingComplete(result);
  }, [onLoadingComplete]);

  // Calculate dimensions based on aspect ratio
  let finalWidth = width;
  let finalHeight = height;

  if (aspectRatio && !fill && (!width || !height)) {
    const ratio =
      typeof aspectRatio === "string"
        ? parseFloat(aspectRatio.split("/").reduce((a, b) => a / b))
        : aspectRatio;

    if (width && !height) {
      finalHeight = Math.round(width / ratio);
    } else if (height && !width) {
      finalWidth = Math.round(height * ratio);
    } else {
      finalWidth = 300; // Default width
      finalHeight = Math.round(300 / ratio);
    }
  }

  // Build image props
  const imageProps = {
    src: currentSrc,
    alt,
    priority,
    fill,
    quality,
    sizes,
    onLoadingComplete,
    onError: handleError,
    className,
    style: {
      ...style,
      aspectRatio: fill && aspectRatio ? aspectRatio : undefined,
    },
    ...props,
  };

  // Add width/height if not fill
  if (!fill) {
    imageProps.width = finalWidth;
    imageProps.height = finalHeight;
  }

  // Add placeholder if specified
  if (placeholder) {
    imageProps.placeholder = placeholder;
    if (placeholder === "blur" && blurDataURL) {
      imageProps.blurDataURL = blurDataURL;
    }
  }

  // If both original and default images failed, show a simple fallback
  if (hasErrored && currentSrc === defaultImage) {
    return (
      <div 
        className={`image-fallback ${className}`}
        style={{
          width: fill ? '100%' : finalWidth,
          height: fill ? '100%' : finalHeight,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          ...style
        }}
      >
        {alt || 'Image not available'}
      </div>
    );
  }

  return <Image {...imageProps} />;
};

// PropTypes validation
NextImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  aspectRatio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultImage: PropTypes.string,
  priority: PropTypes.bool,
  fill: PropTypes.bool,
  quality: PropTypes.number,
  sizes: PropTypes.string,
  placeholder: PropTypes.oneOf(["blur", "empty"]),
  blurDataURL: PropTypes.string,
  onLoadingComplete: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  timeout: PropTypes.number,
};

export default NextImage;
