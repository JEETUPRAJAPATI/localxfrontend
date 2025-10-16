import { memo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types"; // Import PropTypes for prop validation

import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Redux selector
const storeSelectorData = createSelector(
  (state) => state.sponsers,
  (sponsers) => ({
    sponser_heading_DATA: sponsers?.heading || "",
    sponsers_DATA: sponsers?.data || [],
  })
);

const SponserSites = ({ className = "", ...props }) => {
  const { sponser_heading_DATA, sponsers_DATA } =
    useSelector(storeSelectorData);

  return sponsers_DATA?.length == 0 ? null : (
    <div {...props} className={`sponsered-section ${className}`}>
      <Container>
        <Row>
          <Col>
            <div>
              <h1>{sponser_heading_DATA}</h1>
              <div className="sponsered__links d-flex justify-content-center align-items-center flex-wrap">
                {sponsers_DATA.map((site) => (
                  <a href={site.url} title={`${site.text}`} key={site.id}>
                    {`${site.text}`}
                  </a>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Prop types validation
SponserSites.propTypes = {
  className: PropTypes.string,
};

export default memo(SponserSites);
