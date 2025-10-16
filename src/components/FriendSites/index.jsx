import { memo } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import ReactHtmlParser from "html-react-parser";

import CustomPlaceholder from "@/components/CustomPlaceholder";
import { sanitizeHTML } from "@/utils/helpers";

const FriendSites = ({
  className,
  friends,
  ads,
  isLoading,
  pageHeading_DATA,
  ...props
}) => {
  return (
    <Container {...props} className={`h-100 friend-text ${className || ""}`}>
      <Row className="justify-content-center align-items-center">
        <Col className="text-center p-10">
          {ReactHtmlParser(pageHeading_DATA || "")}
          <Col className="friend__links d-flex justify-content-center align-items-center flex-wrap ">
            {isLoading ? (
              Array.from({ length: 20 }).map((_, index) => (
                <CustomPlaceholder
                  key={index}
                  outerStyle={{ width: "15%", margin: "5px" }}
                />
              ))
            ) : (
              <>
                {friends.map((f) => (
                  <a key={f.id} href={f.url} title={f.title}>
                    {f.text}
                  </a>
                ))}
              </>
            )}
          </Col>
        </Col>
      </Row>

      <div className="mt-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div className="mt-2 text-center" key={index}>
              <CustomPlaceholder />
            </div>
          ))
        ) : (
          <>
            {ads.map((ad) => (
              <div className="mt-2 text-center" key={ad.id}>
                {ReactHtmlParser(ad?.content || "")}{" "}
              </div>
            ))}
          </>
        )}
      </div>
    </Container>
  );
};

FriendSites.propTypes = {
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  friends: PropTypes.array,
  ads: PropTypes.array,
  pageHeading_DATA: PropTypes.string,
};

const mapStateToProps = (state) => {
  return { pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || "") };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(memo(FriendSites));
