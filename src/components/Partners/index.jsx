import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { Carousel, Col, Container, Row } from "react-bootstrap";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import Link from "next/link";

import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Custom
import { ROUTES } from "@/utils/constant.js";

// Dynamic Components
// Lazy-loaded components
const PartnerCard = dynamic(() => import("@/components/Partners/PartnerCard"), {
  ssr: false,
  loading: () => null,
});

// Redux selector
const storeSelectorData = createSelector(
  (state) => state.partners,
  (partners) => ({
    partners_DATA: partners || [],
  })
);

const Partners = ({ className }) => {
  const { partners_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [cardsPerSlide, setCardsPerSlide] = useState(5); // Default to 5

  //:========================================
  // Function Declaration
  //:========================================
  const updateCardsPerSlide = useCallback(() => {
    const width = window.innerWidth;

    if (width >= 1440) {
      setCardsPerSlide(5);
    } else if (width >= 1024) {
      setCardsPerSlide(4);
    } else if (width > 768) {
      setCardsPerSlide(3);
    } else if (width > 480) {
      setCardsPerSlide(2);
    } else {
      setCardsPerSlide(1);
    }
  }, []);

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================
  // Memoize the chunking logic and calculate the chunked data only when dependencies change
  const partnersChunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < partners_DATA.length; i += cardsPerSlide) {
      result.push(partners_DATA.slice(i, i + cardsPerSlide));
    }
    return result; // Return the calculated chunks
  }, [partners_DATA, cardsPerSlide]);

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    updateCardsPerSlide(); // Initial call

    // Debounce resize handler for better performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateCardsPerSlide, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [updateCardsPerSlide]);

  return partners_DATA?.length == 0 ? null : (
    <div className={`home-partners-section partners ${className || ""}`}>
      <Container className="p-0">
        <Row className="g-0">
          <Col>
            <h2 className="our__directory__title text-center">
              <Link href={ROUTES.partners} className="directory__link">
                Our Directory
              </Link>
            </h2>
            <div>
              <Carousel indicators={false} controls={false}>
                {partnersChunks.map((chunk, index) => (
                  <Carousel.Item key={index}>
                    <div className="card-row">
                      {chunk.map((partner, partnerIndex) => (
                        <PartnerCard
                          key={partnerIndex}
                          partner={partner}
                          height={175}
                          itemSize={35}
                        />
                      ))}
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Prop validation
Partners.propTypes = {
  className: PropTypes.string,
};

export default memo(Partners);
