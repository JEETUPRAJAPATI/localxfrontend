import Image from "next/image";
import PropTypes from "prop-types";
import { useState, useCallback, useEffect, useRef } from "react";
import { sanitizeImageUrl } from "../../utils/imageSanitizer";

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
  ...props
}) => {
  // Use refs to prevent infinite loops
  const hasErroredRef = useRef(false);
  const timeoutRef = useRef(null);
  
  // State to track current image source
  const [currentSrc, setCurrentSrc] = useState(() => {
    // Use the sanitizer to validate and clean the URL immediately
    return sanitizeImageUrl(src, defaultImage);
  });

  const [isError, setIsError] = useState(false);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset state when src prop changes
  useEffect(() => {
    // Sanitize the new src URL
    const sanitizedSrc = sanitizeImageUrl(src, defaultImage);
    
    // Only update if different and we haven't errored on this source
    if (sanitizedSrc !== currentSrc && !hasErroredRef.current) {
      console.log(`Image URL updated: ${src} -> ${sanitizedSrc}`);
      setCurrentSrc(sanitizedSrc);
      setIsError(false);
      hasErroredRef.current = false;
    }
  }, [src, defaultImage, currentSrc]);

  // Handle image loading errors - CRITICAL: Prevent infinite loops
  const handleError = useCallback((e) => {
    console.warn(`Image failed to load: ${currentSrc}`);
    
    // Call original onError if provided
    if (onError) onError(e);
    
    // CRITICAL: Only fallback ONCE per component instance
    if (!hasErroredRef.current && currentSrc !== defaultImage) {
      console.log(`Falling back to default image: ${defaultImage}`);
      hasErroredRef.current = true;
      setIsError(true);
      setCurrentSrc(defaultImage);
    } else if (currentSrc === defaultImage) {
      console.error(`Default image also failed: ${defaultImage}`);
      setIsError(true);
    }
  }, [currentSrc, defaultImage, onError]);

  // Handle successful image load
  const handleLoadingComplete = useCallback((result) => {
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
    onLoadingComplete: handleLoadingComplete,
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
  if (isError && currentSrc === defaultImage) {
    return (
      <div 
        className={`image-fallback ${className}`}
        style={{
          width: fill ? '100%' : finalWidth,
          height: fill ? '100%' : finalHeight,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          ...style
        }}
        {...props}
      >
        {alt || 'Image not available'}
      </div>
    );
  }

  // CRITICAL: Validate the current source before rendering Image component
  if (!currentSrc || currentSrc === defaultImage) {
    // Check if we should show the default image or fallback div
    if (currentSrc === defaultImage && !isError) {
      // Render the default image
      return <Image {...imageProps} />;
    }
    
    // Show fallback div if default image also failed
    return (
      <div 
        className={`image-fallback ${className}`}
        style={{
          width: fill ? '100%' : finalWidth,
          height: fill ? '100%' : finalHeight,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          ...style
        }}
        {...props}
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
