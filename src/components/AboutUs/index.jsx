"use client";

import { lazy, memo, Suspense, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ReactHtmlParser from "html-react-parser";

import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice";

import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  getPageAboutAPI,
} from "@/api/apiService.js";
import { setPageProps_ACTION } from "@/store/pageSlice.js";
import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
import { useCallback } from "react";
import { sanitizeHTML } from "@/utils/helpers.js";
import useDeviceSize from "@/customHooks/useDeviceSize.js";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const SponserSites = lazy(() => import("@/components/SponserSites/index.jsx"));

const AboutUs = (props) => {
  const { width } = useDeviceSize();

  //:========================================
  // Component Props
  //:========================================
  const {
    setPageProps_ACTION,
    setSponsers_ACTION,
    setTopSideNavLinks_ACTION,
    about_DATA,
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

        getPageAboutAPI()
          .then((about) =>
            setPageProps_ACTION({
              key: "about",
              data: about,
            })
          )
          .catch((error) => {
            console.error("Error in getPageAboutAPI:", error);
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
        <Container fluid className="h-100 aboutUs">
          <Row>
            <Col style={{ margin: "0 50px" }}>
              {ReactHtmlParser(pageHeading_DATA || "")}
              {pageHeading_DATA?.data && (
                <div className="mt-3 about-title font-weight-200">
                  {isLoading && !about_DATA.title ? (
                    <CustomPlaceholder bg="none" />
                  ) : (
                    ReactHtmlParser(sanitizeHTML(about_DATA?.title || ""))
                  )}
                </div>
              )}

              <div className="about-content">
                {isLoading && !about_DATA.description ? (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CustomPlaceholder key={index} bg="none" />
                    ))}
                  </>
                ) : (
                  ReactHtmlParser(sanitizeHTML(about_DATA?.description || ""))
                )}
              </div>
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

AboutUs.propTypes = {
  // Props
  about_DATA: PropTypes.object,
  pageHeading_DATA: PropTypes.string,
  // Functions
  setPageProps_ACTION: PropTypes.func,
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  about_DATA: state?.page?.about || {},
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setPageProps_ACTION: setPageProps_ACTION,
  setSponsers_ACTION: setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(AboutUs));
