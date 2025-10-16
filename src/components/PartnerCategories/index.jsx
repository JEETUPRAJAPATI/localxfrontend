import { sanitizeHTML, unslugify } from "@/utils/helpers";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactHtmlParser from "html-react-parser";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { lazy, memo, useCallback, useEffect, useState } from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { connect } from "react-redux";

import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
} from "@/api/apiService.js";

import useDeviceSize from "@/customHooks/useDeviceSize.js";
import { setPartnersByCategoryProps } from "@/store/partnersByCategorySlice.js";
import { setSponsers_ACTION } from "@/store/sponsersSlice.js";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice.js";
import { ROUTES } from "@/utils/constant.js";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const SponserSites = lazy(() => import("@/components/SponserSites/index.jsx"));
const PartnerCardImage = lazy(() =>
  import("@/components/Partners/PartnerCardImage/index.jsx")
);

const PartnerCategories = (props) => {
  const router = useRouter();
  // 1. Get URL params
  const { category } = router.query;

  const { width } = useDeviceSize();

  //:========================================
  // Component Props
  //:========================================
  const {
    partners_DATA,
    categoryContent_DATA,
    pageHeading_DATA,
    setSponsers_ACTION,
    setTopSideNavLinks_ACTION,
  } = props;

  //:========================================
  // States Declaration
  //:========================================
  const [keyword, setKeyword] = useState("");

  //:========================================
  // Function Declaration
  //:========================================
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault(); // Prevent form reload
      const trimmedKeyword = keyword.trim(); // Trim the keyword once
      if (trimmedKeyword) {
        // Only redirect if the keyword is non-empty

        router.push({
          pathname: `${ROUTES.siteLinkSearch}?q=${encodeURIComponent(
            trimmedKeyword
          )}`,
        });
      }
    },
    [keyword] // Dependencies for the callback
  );
  const handleInputChange = useCallback((e) => {
    setKeyword(e.target.value);
  }, []);

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        getCategoryTopSideNavLinksAPI()
          .then((topSideNavLinks) => setTopSideNavLinks_ACTION(topSideNavLinks))
          .catch((error) => {
            console.error("Error in getCategoryTopSideNavLinksAPI:", error);
          });

        getCategorySponsersAPI({ deviceWidth: width })
          .then((sponsers) => setSponsers_ACTION(sponsers))
          .catch((error) => {
            console.error("Error in getCategorySponsersAPI:", error);
          });
      } catch (error) {
        console.error("Failed to fetch common API:", error);
      }
    };
    fetchAPI();
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  return (
    <>
      <FixedHeader />
      <div className="partnerCategories">
        <Container className="pccnt">
          <Row className="mt-3">
            <Col>
              <Breadcrumb className="breadcrumb-area">
                <Breadcrumb.Item linkAs={Link} href={ROUTES.home}>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} href={"/partners"}>
                  Partners
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{unslugify(category)}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              {ReactHtmlParser(pageHeading_DATA || "")}
              <Form onSubmit={handleSearch}>
                <InputGroup className="search-input-group">
                  <Form.Control
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="basic-addon2"
                    className="search-input"
                    value={keyword}
                    onChange={handleInputChange}
                  />
                  <InputGroup.Text
                    id="basic-addon2"
                    className="search-button-container"
                  >
                    <Button
                      variant="primary"
                      type="submit"
                      className="search-button"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>
                  </InputGroup.Text>
                </InputGroup>
              </Form>
            </Col>
          </Row>

          <Row style={{ marginTop: "3px", padding: "10px" }}>
            {partners_DATA.map((partner, partnerIndex) => (
              <Col lg={3} key={partner?.id} className="mb-2 pclist">
                <PartnerCardImage sr_no={partnerIndex + 1} partner={partner} />
              </Col>
            ))}
          </Row>
          {categoryContent_DATA && (
            <>
              <hr />
              <Row className="mt-3">
                <Col>
                  <div className="partnerCategoriesDesc">
                    {ReactHtmlParser(sanitizeHTML(categoryContent_DATA))}
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Container>
        <SponserSites className="mt-4" />
      </div>

      <Footer className="mt-4" />
    </>
  );
};

PartnerCategories.propTypes = {
  // Props
  partners_DATA: PropTypes.array,
  categoryContent_DATA: PropTypes.string,
  pageHeading_DATA: PropTypes.string,
  // Functions
  setPartnersByCategoryProps_ACTION: PropTypes.func,
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  partners_DATA: state?.partnersByCategory?.list || [],
  categoryContent_DATA: state?.partnersByCategory?.content || "",
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setPartnersByCategoryProps_ACTION: setPartnersByCategoryProps,
  setSponsers_ACTION: setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(PartnerCategories));
