import { memo } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "react-bootstrap";
import PropTypes from "prop-types"; // Import PropTypes
import dynamic from "next/dynamic";
import Link from "next/link";

// Custom
import { slugify } from "@/utils/helpers";
import ListComponent from "@/components/CustomFixedListComponent";

// Dynamic Components
const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
});

const PartnerCard = ({ partner, ...props }) => {
  return (
    <Card className="partner-card">
      <Card.Header>
        <Link href={`/partners/${slugify(partner.category)}`}>
          {partner.category}
        </Link>
      </Card.Header>
      <Card.Body>
        <ListComponent
          items={partner.siteLinks}
          {...props}
          renderRow={({ item: site, index: siteIndex }) => (
            <div
              className="d-flex align-items-center site_block"
              key={site?.id}
            >
              <div className="site_serial_no">{siteIndex + 1}.</div>
              <div className="partner-pic me-1">
                <NextImage
                  src={site?.logo}
                  alt={site?.title}
                  width={18}
                  height={18}
                  className="site_icon"
                  sizes="18px"
                  loading="lazy"
                  style={{ width: '18px', height: '18px' }}
                />
              </div>

              <a
                href={site?.url}
                className="site__link flex-grow-1 text-truncate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={site?.title}
              >
                {site?.title}
              </a>
              <div className="search__icon ms-2">
                <Link
                  href={`/partners/${slugify(partner.category)}/${slugify(
                    site?.title
                  )}`}
                  className="site__link flex-grow-1 text-truncate"
                  aria-label={`Search ${site?.title}`}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </Link>
              </div>
            </div>
          )}
        />
      </Card.Body>
    </Card>
  );
};

// Prop validation
PartnerCard.propTypes = {
  partner: PropTypes.shape({
    category: PropTypes.string.isRequired,
    siteLinks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        logo: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default memo(PartnerCard);
