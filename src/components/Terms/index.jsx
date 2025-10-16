// src/components/Terms.js
import { memo, lazy, useState, useCallback, useEffect, Suspense } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { connect } from "react-redux";
import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  getPageTermsAPI,
} from "@/api/apiService.js";
import ReactHtmlParser from "html-react-parser";

import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
import PropTypes from "prop-types";
import { setPageProps_ACTION } from "@/store/pageSlice.js";
import { setSponsers_ACTION } from "@/store/sponsersSlice.js";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice.js";
import { sanitizeHTML } from "@/utils/helpers.js";
import useDeviceSize from "@/customHooks/useDeviceSize.js";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const SponserSites = lazy(() => import("@/components/SponserSites/index.jsx"));

const Terms = (props) => {
  const { width } = useDeviceSize();

  //:========================================
  // Component Props
  //:========================================
  const {
    setPageProps_ACTION,
    setSponsers_ACTION,
    setTopSideNavLinks_ACTION,
    terms_DATA,
    pageHeading_DATA,
  } = props;

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        setIsLoading(true);

        getPageTermsAPI()
          .then((terms) =>
            setPageProps_ACTION({
              key: "terms",
              data: terms,
            })
          )
          .catch((error) => {
            console.error("Error in getPageTermsAPI:", error);
          })
          .finally(() => setIsLoading(false));

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
      <div className="wrapper">
        <Container fluid className="h-100 terms">
          <Row>
            <Col style={{ margin: "0 50px" }}>
              {ReactHtmlParser(pageHeading_DATA || "")}
              {terms_DATA && (
                <ul className="terms_conditions">
                  {isLoading && terms_DATA.length == 0 ? (
                    <>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <CustomPlaceholder key={index} as="li" bg="none" />
                      ))}
                    </>
                  ) : (
                    <>
                      {terms_DATA.map((term, index) => (
                        <li key={index}>
                          <span>{index + 1}</span>
                          {ReactHtmlParser(sanitizeHTML(term.terms))}
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              )}
            </Col>
          </Row>
        </Container>

        <Suspense fallback={<CustomPlaceholder />}>
          <SponserSites className="mt-4" />
        </Suspense>
      </div>
      <Footer className="mt-4" />
    </>
  );
};

Terms.propTypes = {
  // Props
  terms_DATA: PropTypes.array,
  pageHeading_DATA: PropTypes.string,

  // Functions
  setPageProps_ACTION: PropTypes.func,
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  terms_DATA: state?.page?.terms || [],
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setPageProps_ACTION: setPageProps_ACTION,
  setSponsers_ACTION: setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(Terms));
