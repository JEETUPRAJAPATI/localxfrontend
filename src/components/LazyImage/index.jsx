import { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation

const LazyImage = ({
  src = "",
  alt = "",
  defaultImage = "/images/img-placeholder.jpg",
  isDynamic = true,
  ...props
}) => {
  const imgRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // Disconnect observer once the image is visible
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current); // Observe the image reference
    }

    return () => {
      observer.disconnect(); // Clean up observer on unmount
    };
  }, [imgRef]);

  const handleContextMenu = (e) => {
    e.preventDefault(); // Disable right-click context menu
  };

  const handleDragStart = (e) => {
    e.preventDefault(); // Disable drag and drop
  };

  return (
    <img
      ref={imgRef}
      src={isDynamic ? (isVisible ? src : defaultImage) : src}
      alt={alt}
      loading={isDynamic ? "lazy" : "eager"}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      {...props}
    />
  );
};

// Adding prop types validation
LazyImage.propTypes = {
  src: PropTypes.string, // Validate src prop as a required string
  alt: PropTypes.string, // Validate alt prop as a required string
  defaultImage: PropTypes.string, // Validate defaultImage as an optional string
  isDynamic: PropTypes.bool,
};

export default memo(LazyImage);
