import { useState, memo } from "react";
import PropTypes from "prop-types"; // Import PropTypes for props validation
import Carousel from "react-bootstrap/Carousel";
import Lightbox from "yet-another-react-lightbox";
import {
  Fullscreen,
  Thumbnails,
  Slideshow,
  Zoom,
  Counter,
} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css"; // Import styles for the lightbox
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

import NextImage from "@/components/NextImage";

const ThumbnailCarousel = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleLightboxSlideChange = (newIndex) => {
    setIndex(newIndex); // Synchronize with Lightbox
  };

  const openLightboxAtIndex = (selectedIndex) => {
    setIndex(selectedIndex); // Ensure correct index is active
    setLightboxOpen(true); // Open Lightbox
  };

  return (
    <div className="customLightBox">
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        interval={null} // Disable automatic sliding
      >
        {images.map((image, idx) => (
          <Carousel.Item key={image?.id || idx}>
            <NextImage
              src={image.src}
              alt={image.alt || `Slide ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={85}
              onClick={() => openLightboxAtIndex(idx)}
            />
          </Carousel.Item>
        ))}
      </Carousel>
      <div className="thumbnail-container mt-3">
        <div className="carousel-thumbs-wrapper">
          {images.map((image, idx) => (
            <div
              key={image?.id || idx}
              className={`carousel-thumb ${index === idx ? "active" : ""}`}
            >
              <NextImage
                src={image.src}
                alt={`Thumbnail ${image?.id || idx + 1}`}
                width={60}
                height={60}
                quality={75}
                className="thumbnail"
                onClick={() => handleSelect(idx)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox for full-screen image */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((img) => ({ src: img.src }))}
        index={index}
        onSlideChange={handleLightboxSlideChange} // Synchronize with Carousel
        plugins={[Fullscreen, Slideshow, Zoom, Counter, Thumbnails]}
      />
    </div>
  );
};

// Prop validation for the component
ThumbnailCarousel.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default memo(ThumbnailCarousel);
