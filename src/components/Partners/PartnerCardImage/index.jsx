import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { Card } from "react-bootstrap";
import { connect } from "react-redux";
import dynamic from "next/dynamic";
import Link from "next/link";
import PropTypes from "prop-types"; // Import PropTypes
import { slugify } from "@/utils/helpers.js";

const LazyImage = dynamic(() => import("@/components/LazyImage"), {
  ssr: false,
});
const PartnerCardImage = ({ sr_no, partner }) => {
  const detailUrl = `/partners/${slugify(
    partner?.category_name || ""
  )}/${slugify(partner?.title || "")}`;

  return (
    <Card className="partner-card-image">
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <div className="site-logo">
            <LazyImage
              src={partner.logo}
              alt={partner.title}
              height="100%"
              width="100%"
            />
          </div>
          <Link href={detailUrl}>
            <span className="sr-no">{sr_no}.</span>
            <span className="site-title">{partner.title}</span>
          </Link>
          <Link href={detailUrl} className="site-link">
            <FontAwesomeIcon icon={faSearch} />
          </Link>
        </div>
      </Card.Header>
      <Card.Body as={Link} href={detailUrl}>
        <LazyImage
          src={partner.image}
          alt={partner.title}
          height="100%"
          width="100%"
          className="partner-website-image object-fit-cover"
        />
      </Card.Body>
    </Card>
  );
};

// Prop validation
PartnerCardImage.propTypes = {
  sr_no: PropTypes.number.isRequired,
  partner: PropTypes.shape({
    logo: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category_name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

// Map state to props
const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(memo(PartnerCardImage));
