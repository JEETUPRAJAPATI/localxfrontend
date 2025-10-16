import { memo, useState } from "react";
import { Col, Dropdown, Row } from "react-bootstrap";
import dynamic from "next/dynamic";
import PropTypes from "prop-types"; // Import PropTypes for prop validation

import { removeATags, removeScriptTags, sanitizeHTML } from "@/utils/helpers";
import ReactHtmlParser from "html-react-parser";

import { faEnvelope as faEnvelopeRegular } from "@fortawesome/free-regular-svg-icons";
import { faCopy, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ThumbnailCarousel = dynamic(
  () => import("@/components/ThumbnailCarousel/index.jsx"),
  { ssr: false }
);
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  { ssr: false }
);

const PostView = ({
  isSamePost = false,
  isLoading = false,
  tableData,
  images,
  title,
  description,
  email,
  phone,
  formattedDate,
  relativeTime,
}) => {
  //:========================================
  // States Declaration
  //:========================================
  const [showPostRelativeTime, setShowPostRelativeTime] = useState(true);

  //:========================================
  // Function Declaration
  //:========================================
  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied This text...:" + text);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // Toggle between relative time and actual date
  const toggleDate = () => setShowPostRelativeTime((prev) => !prev);

  return (
    <div className="postView">
      <Row className="mt-3 align-items-center">
        <Col>
          <Dropdown autoClose={false}>
            <Dropdown.Toggle variant="primary" className="reply-action">
              Reply
              <FontAwesomeIcon icon={faEnvelopeRegular} className="ms-1 icon" />
              <FontAwesomeIcon icon={faPhone} className="ms-1 icon" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {isLoading && !isSamePost ? (
                <>
                  <Dropdown.Item
                    as="button"
                    className="d-flex align-items-center"
                  >
                    <FontAwesomeIcon
                      className="icon me-1"
                      icon={faEnvelopeRegular}
                    />
                    <CustomPlaceholder outerStyle={{ width: "100%" }} />
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="button"
                    className="d-flex align-items-center"
                  >
                    <FontAwesomeIcon className="icon me-1" icon={faPhone} />
                    <CustomPlaceholder outerStyle={{ width: "100%" }} />
                  </Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item
                    as="button"
                    className="d-flex align-items-center"
                    onClick={() => handleCopy(email || "")}
                  >
                    <FontAwesomeIcon
                      className="icon me-1"
                      icon={faEnvelopeRegular}
                    />
                    {sanitizeHTML(email || "Email ID")}
                    <FontAwesomeIcon icon={faCopy} className="ms-2 icon" />
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="button"
                    className="d-flex align-items-center"
                    onClick={() => handleCopy(phone || "")}
                  >
                    <FontAwesomeIcon className="icon me-1" icon={faPhone} />
                    {sanitizeHTML(phone || "Contact No")}
                    <FontAwesomeIcon icon={faCopy} className="ms-2 icon" />
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col>
          <div className="d-flex align-items-center justify-content-end">
            <strong className="top-post-date-label">Posted:</strong>
            {isLoading && !isSamePost ? (
              <CustomPlaceholder
                as="div"
                outerStyle={{ width: "50px" }}
                className="ms-1 "
              />
            ) : (
              <span className="ms-1 post-date" onClick={toggleDate}>
                {showPostRelativeTime
                  ? sanitizeHTML(relativeTime)
                  : sanitizeHTML(formattedDate)}
              </span>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-3 text-center">
        <Col>
          <h1 className="heading">
            {isLoading && !isSamePost ? (
              <CustomPlaceholder />
            ) : (
              sanitizeHTML(title)
            )}
          </h1>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          {isLoading && !isSamePost ? (
            <CustomPlaceholder className="corousel-placeholder" />
          ) : (
            <ThumbnailCarousel images={images || []} />
          )}
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <div className="table-responsive">{tableData}</div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col className="post-description">
          {isLoading && !isSamePost ? (
            <>
              <CustomPlaceholder />
            </>
          ) : (
            ReactHtmlParser(
              sanitizeHTML(removeScriptTags(removeATags(description)))
            )
          )}
        </Col>
      </Row>
    </div>
  );
};
PostView.propTypes = {
  tableData: PropTypes.node.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  email: PropTypes.string,
  phone: PropTypes.string,
  postDate: PropTypes.string,
  relativeTime: PropTypes.string,
  formattedDate: PropTypes.string,
  isLoading: PropTypes.bool,
  isSamePost: PropTypes.bool,
};

export default memo(PostView);
