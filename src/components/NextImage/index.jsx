import Image from "next/image";
import PropTypes from "prop-types";

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
  // Handle fallback image on error
  const handleError = (e) => {
    if (onError) onError(e);
    if (defaultImage && e.target.src !== defaultImage) {
      e.target.src = defaultImage;
    }
  };

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
    src: src || defaultImage,
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
};

export default NextImage;
