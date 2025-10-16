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
  // Use refs to prevent infinite loops and ensure stability
  const hasErroredRef = useRef(false);
  const timeoutRef = useRef(null);
  const isUnmountedRef = useRef(false);
  
  // State to track current image source - with error handling
  const [currentSrc, setCurrentSrc] = useState(() => {
    try {
      return sanitizeImageUrl(src, defaultImage);
    } catch (error) {
      console.warn('NextImage: Error initializing src:', error);
      return defaultImage;
    }
  });

  const [isError, setIsError] = useState(false);

  // Component unmount tracking
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Reset state when src prop changes - with improved error handling
  useEffect(() => {
    try {
      // Prevent updates if component is unmounted
      if (isUnmountedRef.current) return;
      
      // Sanitize the new src URL
      const sanitizedSrc = sanitizeImageUrl(src, defaultImage);
      
      // Only update if different and we haven't errored on this source
      if (sanitizedSrc !== currentSrc && !hasErroredRef.current) {
        console.log(`NextImage: URL updated from ${currentSrc} to ${sanitizedSrc}`);
        setCurrentSrc(sanitizedSrc);
        setIsError(false);
        hasErroredRef.current = false;
      }
    } catch (error) {
      console.error('NextImage: Error in useEffect:', error);
      if (!isUnmountedRef.current) {
        setCurrentSrc(defaultImage);
        setIsError(true);
      }
    }
  }, [src, defaultImage, currentSrc]);

  // Handle image loading errors - CRITICAL: Prevent infinite loops
  const handleError = useCallback((e) => {
    // Prevent actions if component is unmounted
    if (isUnmountedRef.current) return;
    
    console.warn(`NextImage: Image failed to load: ${currentSrc}`);
    
    // Call original onError if provided
    try {
      if (onError) onError(e);
    } catch (error) {
      console.error('NextImage: Error in onError callback:', error);
    }
    
    // CRITICAL: Only fallback ONCE per component instance
    if (!hasErroredRef.current && currentSrc !== defaultImage) {
      console.log(`NextImage: Falling back to default image: ${defaultImage}`);
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
    let ratio;
    if (typeof aspectRatio === "string" && aspectRatio.includes("/")) {
      try {
        const parts = aspectRatio.split("/");
        ratio = parseFloat(parts[0]) / parseFloat(parts[1]);
      } catch {
        ratio = 1; // Default ratio if parsing fails
      }
    } else if (typeof aspectRatio === "number") {
      ratio = aspectRatio;
    } else {
      ratio = 1; // Default ratio
    }

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
