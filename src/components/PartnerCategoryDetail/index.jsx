"use client";
import { sanitizeHTML, truncatedContent, unslugify } from "@/utils/helpers";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { Breadcrumb, Col, Container, Row } from "react-bootstrap";
import { connect } from "react-redux";

import PropTypes from "prop-types";

import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  getDetailPartnerByCategoryAPI,
} from "@/api/apiService.js";
import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import { setPartnersByCategoryProps } from "@/store/partnersByCategorySlice.js";
import { setSponsers_ACTION } from "@/store/sponsersSlice.js";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice.js";
import { ROUTES } from "@/utils/constant.js";
import ReactHtmlParser from "html-react-parser";

import FixedHeader from "@/components/FixedHeader/index.jsx";
import Footer from "@/components/Footer";

const SponserSites = dynamic(() => import("@/components/SponserSites"), {
  ssr: false,
});
const PartnerCardImage = dynamic(
  () => import("@/components/Partners/PartnerCardImage"),
  {
    ssr: false,
  }
);
const LazyImage = dynamic(() => import("@/components/LazyImage"), {
  ssr: false,
});

const PartnerCategoryDetail = (props) => {
  const router = useRouter();
  const { category, siteSlug: title } = router.query;
  const { width } = useDeviceSize();

  //:========================================
  // Component Props
  //:========================================
  const {
    partner_DATA,
    partners_DATA,
    categoryContent_DATA,
    previewHeaderImg_DATA,
    partnerLogoImg_DATA,
    partnerPageImg_DATA,
    setPartnersByCategoryProps_ACTION,
    setSponsers_ACTION,
    setTopSideNavLinks_ACTION,
  } = props;
  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  //:========================================
  // Function Declaration
  //:========================================
  // Fetch Partner Data
  const fetchPartnerList = useCallback(() => {
    const fetchAPI = async () => {
      try {
        setIsLoading(true);
        getDetailPartnerByCategoryAPI(unslugify(category), unslugify(title))
          .then(({ detail, others, content }) => {
            setPartnersByCategoryProps_ACTION({
              key: "detail",
              data: detail,
            });
            setPartnersByCategoryProps_ACTION({
              key: "content",
              data: content,
            });
            setPartnersByCategoryProps_ACTION({
              key: "others",
              data: others,
            });
          })
          .catch((error) => {
            console.error("Error in getDetailPartnerByCategoryAPI:", error);
          })
          .finally(() => setIsLoading(false));
      } catch (error) {
        console.error("Failed to fetch partners by category:", error);
      }
    };
    fetchAPI();
  }, [category, title]);

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

  useEffect(() => {
    fetchPartnerList();
  }, [fetchPartnerList]);

  return (
    <>
      <FixedHeader />
      <div className="partnerCategoryDetail">
        <Container className="pcdcnt">
          <Row className="mt-3">
            <Col>
              <Breadcrumb className="breadcrumb-area">
                <Breadcrumb.Item linkAs={Link} href={ROUTES.home}>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} href={ROUTES.partners}>
                  Partners
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  linkAs={Link}
                  href={ROUTES.partnerCategory.replace(":category", category)}
                >
                  {unslugify(category)}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{unslugify(title)}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row>
            <Col lg={7}>
              <div className="link_block">
                {isLoading && !previewHeaderImg_DATA && !partnerLogoImg_DATA ? (
                  <CustomPlaceholder />
                ) : (
                  <>
                    <div className="preview_header">
                      <LazyImage src={previewHeaderImg_DATA} />
                      <div
                        className="preview_url"
                        title={partner_DATA?.shortUrl}
                      >
                        <LazyImage
                          src={partnerLogoImg_DATA}
                          className="site_icon me-1"
                        />
                        {truncatedContent(partner_DATA?.shortUrl || "", 20)}
                      </div>
                    </div>
                  </>
                )}

                {isLoading && !partnerPageImg_DATA ? (
                  <CustomPlaceholder />
                ) : (
                  <>
                    <a href={partner_DATA.url} target="_blank" rel="noreferrer">
                      <LazyImage src={partnerPageImg_DATA} />
                    </a>
                  </>
                )}
              </div>

              <a
                className="click_here text-center"
                href={partner_DATA.url}
                target="_blank"
                rel="noreferrer"
              >
                <h2 className="title">Click Here To Visit Website</h2>
              </a>
            </Col>
            <Col lg={5}>
              <div className="mt-4 me-3">
                {isLoading && !partner_DATA.title ? (
                  <CustomPlaceholder />
                ) : (
                  <>
                    <h1 className="title">{partner_DATA.title}</h1>
                  </>
                )}

                <p className="short_link mb-1">{partner_DATA.shortUrl}</p>
                <div className="ratings">
                  <span className="rating_label">Ratings </span>
                  {Array.from({ length: 5 }, (_, index) => (
                    <FontAwesomeIcon
                      key={index}
                      icon={
                        index < (partner_DATA?.rating || 0)
                          ? faStar
                          : faStarRegular
                      } // Render solid star if index < rating
                      className={
                        index < (partner_DATA?.rating || 0) ? "checked" : ""
                      }
                    />
                  ))}
                </div>
                <div className="site_description">
                  {ReactHtmlParser(
                    sanitizeHTML(partner_DATA?.description || "")
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        <Container className="pccnt mt-5">
          <Row>
            <Col>
              <h3 className="header-title">
                <Link href={`/partners/${category}`}>
                  {unslugify(category)}
                </Link>{" "}
                Like <span>{`${unslugify(title)}'S`}</span>
              </h3>
            </Col>
          </Row>

          <Row style={{ marginTop: "3px", padding: "10px" }}>
            {isLoading && partners_DATA.length == 0 ? (
              <>
                {Array.from({ length: 20 }).map((_, index) => (
                  <Col lg={3} key={index} className="mb-2 pclist">
                    <CustomPlaceholder />
                  </Col>
                ))}
              </>
            ) : (
              <>
                {partners_DATA.map((partner, partnerIndex) => (
                  <Col lg={3} key={partner?.id} className="mb-2 pclist">
                    <PartnerCardImage
                      sr_no={partnerIndex + 1}
                      partner={partner}
                    />
                  </Col>
                ))}
              </>
            )}
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

PartnerCategoryDetail.propTypes = {
  // Props
  partner_DATA: PropTypes.object,
  partners_DATA: PropTypes.array,
  categoryContent_DATA: PropTypes.string,

  previewHeaderImg_DATA: PropTypes.string,
  partnerLogoImg_DATA: PropTypes.string,
  partnerPageImg_DATA: PropTypes.string,
  pageHeading_DATA: PropTypes.string,

  // Functions
  setPartnersByCategoryProps_ACTION: PropTypes.func,
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  partner_DATA: state?.partnersByCategory?.detail || {},
  partners_DATA: state?.partnersByCategory?.others || [],
  categoryContent_DATA: state?.partnersByCategory?.content || "",
  previewHeaderImg_DATA:
    state?.partnersByCategory?.detail?.preview_header || "",
  partnerLogoImg_DATA: state?.partnersByCategory?.detail?.logo || "",
  partnerPageImg_DATA: state?.partnersByCategory?.detail?.image || "",
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setPartnersByCategoryProps_ACTION: setPartnersByCategoryProps,
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(PartnerCategoryDetail));
