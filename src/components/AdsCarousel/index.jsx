import { memo } from "react";
import PropTypes from "prop-types";
import { Carousel } from "react-bootstrap";
import dynamic from "next/dynamic";

const NextImage = dynamic(() => import("@/components/NextImage"), {
  ssr: false,
});

const AdsCarousel = ({ adsList }) => {
  return adsList.length == 0 ? null : (
    <>
      <Carousel
        interval={3000} // Auto-slide every 3 seconds
        controls={true}
        indicators={true}
        nextIcon={
          <span
            className="carousel-control-next-icon"
            style={{ filter: "invert(100%)", height: "18px" }} // Change icon color
            aria-hidden="true"
          />
        }
        prevIcon={
          <span
            className="carousel-control-prev-icon"
            style={{ filter: "invert(100%)", height: "18px" }} // Change icon color
            aria-hidden="true"
          />
        }
        className="adsCarousel"
      >
        {adsList.map((ads, index) => (
          <Carousel.Item key={index} className="adsItem">
            <a href={ads.url} target="_blank" rel="noopener noreferrer">
              <NextImage
                src={ads.img}
                alt={ads?.title || "left-post-ads"}
                className="adsItemImg"
                fill
              />
            </a>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
};

AdsCarousel.propTypes = {
  adsList: PropTypes.array,
};

export default memo(AdsCarousel);
