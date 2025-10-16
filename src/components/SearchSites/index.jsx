import { sanitizeHTML, slugify, truncatedContent } from "@/utils/helpers";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { lazy, memo, Suspense, useCallback, useEffect, useState } from "react";
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
  getSearchPartnersAPI,
} from "@/api/apiService.js";
import CustomPagination from "@/components/CustomPagination/index.jsx";
import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import { setPartnersByCategoryProps } from "@/store/partnersByCategorySlice.js";
import { setSponsers_ACTION } from "@/store/sponsersSlice.js";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice.js";
import { ROUTES } from "@/utils/constant.js";
import ReactHtmlParser from "html-react-parser";
import PropTypes from "prop-types";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const LazyImage = lazy(() => import("@/components/LazyImage/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const SponserSites = lazy(() => import("@/components/SponserSites/index.jsx"));
const AlertMessage = lazy(() => import("@/components/AlertMessage/index.jsx"));

const SearchSites = (props) => {
  const router = useRouter();
  const { width } = useDeviceSize();
  // Get query parameters
  // Get current query params from URL
  const currentKeyword = router.query.q || "";
  const currentPage = router.query.page || "1";
  //:========================================
  // Component Props
  //:========================================
  const {
    initialKeyword = "",
    initialPage = 1,
    partners_DATA,
    partnersPagination_DATA,
    pageHeading_DATA,
    setPartnersProps_ACTION,
    setSponsers_ACTION,
    setTopSideNavLinks_ACTION,
  } = props;

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  // Initialize state with values from props
  const [keyword, setKeyword] = useState(initialKeyword);
  const [page, setPage] = useState(initialPage);
  const [alertMessage, setAlertMessage] = useState({ show: false });

  //:========================================
  // Helper Function for Navigation
  //:========================================
  const buildSearchUrl = (keyword, page) => {
    const trimmedKeyword = keyword.trim();
    return {
      pathname: ROUTES.siteLinkSearch,
      query: {
        ...(trimmedKeyword && { q: trimmedKeyword }),
        page: page || 1,
      },
    };
  };

  //:========================================
  // Fetch Common API Data
  //:========================================
  const fetchCommonAPI = useCallback(async () => {
    try {
      const [topSideNavLinks, sponsers] = await Promise.all([
        getCategoryTopSideNavLinksAPI().catch((err) => {
          console.error("Error in getCategoryTopSideNavLinksAPI:", err);
          return null;
        }),
        getCategorySponsersAPI({ deviceWidth: width }).catch((err) => {
          console.error("Error in getCategorySponsersAPI:", err);
          return null;
        }),
      ]);

      if (topSideNavLinks) setTopSideNavLinks_ACTION(topSideNavLinks);
      if (sponsers) setSponsers_ACTION(sponsers);
    } catch (error) {
      console.error("Failed to fetch common API:", error);
    }
  }, []);

  //:========================================
  // Fetch Search Partner Data
  //:========================================
  const fetchSearchedPartnerList = useCallback(async (searchParams) => {
    setIsLoading(true);
    setAlertMessage({ show: false });
    const { keyword = "", page = 1 } = searchParams;
    const sanitizedKeyword = keyword ? sanitizeHTML(keyword.trim()) : "";
    const params = {
      page,
      ...(sanitizedKeyword && { searchKeyword: sanitizedKeyword }),
    };

    try {
      const [partnerData] = await Promise.all([
        getSearchPartnersAPI(params).catch((err) => {
          console.error("Error in getSearchPartnersAPI:", err);
          return null;
        }),
      ]);

      if (partnerData) {
        const { list, pagination } = partnerData;
        setPartnersProps_ACTION({ key: "searchPartnersList", data: list });
        setPartnersProps_ACTION({
          key: "searchPartnersPagination",
          data: pagination,
        });

        if (!list.length) {
          setAlertMessage({
            show: true,
            type: "info",
            message: "No Partners.",
            showDismissible: false,
            showHeading: false,
            className: "text-center",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch search partners:", error);
      setAlertMessage({
        show: true,
        type: "error",
        message: "Something went wrong!!!",
        showDismissible: false,
        showHeading: false,
        className: "text-center",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  //:========================================
  // Event Handlers
  //:========================================
  const handlePageChange = useCallback(
    (pageNumber) => {
      if (pageNumber === page) return;
      router.push(buildSearchUrl(keyword, pageNumber));
    },
    [page, keyword, router]
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      router.push(buildSearchUrl(keyword, 1), undefined, { scroll: true });
    },
    [keyword, router]
  );

  const handleInputChange = useCallback((e) => {
    setKeyword(e.target.value);
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  useEffect(() => {
    fetchSearchedPartnerList({
      page: currentPage || 1,
      keyword: currentKeyword || "",
    });
    setPage(currentPage || 1);
    setKeyword(currentKeyword || "");
  }, [currentPage, currentKeyword]);

  return (
    <>
      <Suspense fallback={<CustomPlaceholder />}>
        <FixedHeader />
      </Suspense>
      <div className="searchSiteList">
        <Container className="sscnt">
          <Row className="mt-3">
            <Col>
              <Breadcrumb className="breadcrumb-area">
                <Breadcrumb.Item linkAs={Link} href={ROUTES.home}>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Partners</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Row>
                <Col>
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
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              {}
              {currentKeyword ? (
                ReactHtmlParser(pageHeading_DATA || "")
              ) : (
                <h1 className="heading">All RESULTS</h1>
              )}
              <AlertMessage {...alertMessage} />
              <div className="search-results">
                {isLoading && partners_DATA.length == 0 ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Row key={`${index}`} className="search-result">
                      <Col lg={12}>
                        <CustomPlaceholder />
                      </Col>
                    </Row>
                  ))
                ) : (
                  <>
                    {partners_DATA.map((item) => (
                      <Row key={item.id} className="search-result">
                        <Col lg={1} md={1} sm={12}>
                          <div className="sr-no">{item.srNo}</div>
                        </Col>
                        <Col lg={2} md={2} sm={12}>
                          <div className="search-image">
                            <Link
                              href={`/partners/${slugify(
                                item.category_name
                              )}/${slugify(item.title)}`}
                            >
                              <div className="site-short-name">
                                {item.title}
                              </div>
                              <div className="site-small-thumb">
                                <LazyImage
                                  src={item.image}
                                  alt={`Logo of ${item.title}`}
                                />
                              </div>
                            </Link>
                          </div>
                        </Col>
                        <Col className="search-description">
                          <div className="site-title">
                            <Link
                              href={`/partners/${slugify(
                                item.category_name
                              )}/${slugify(item.title)}`}
                            >
                              {item.title} - {item.category_name}
                            </Link>
                          </div>
                          <div className="site-breadcrumbs">
                            <Breadcrumb className="breadcrumb-area">
                              <Breadcrumb.Item
                                linkAs={Link}
                                href={`/partners/${slugify(
                                  item.category_name
                                )}`}
                              >
                                {item.category_name}
                              </Breadcrumb.Item>

                              <Breadcrumb.Item
                                linkAs={Link}
                                href={`/partners/${slugify(
                                  item.category_name
                                )}/${slugify(item.title)}`}
                              >
                                {item.title}
                              </Breadcrumb.Item>
                            </Breadcrumb>
                          </div>
                          <div className="site-ratings mt-1">
                            <span>Ratings: </span>
                            {Array.from({ length: 5 }, (_, index) => (
                              <FontAwesomeIcon
                                key={index}
                                color="gold"
                                icon={
                                  index < (item?.rating || 0)
                                    ? faStar
                                    : faStarRegular
                                } // Render solid star if index < rating
                                className={
                                  index < (item?.rating || 0) ? "checked" : ""
                                }
                              />
                            ))}
                          </div>
                          <div className="site-description">
                            {ReactHtmlParser(
                              sanitizeHTML(
                                truncatedContent(item.description, 500)
                              )
                            )}
                            <Link
                              href={`/partners/${slugify(
                                item.category_name
                              )}/${slugify(item.title)}`}
                              className="readMore"
                            >
                              Read More
                            </Link>
                          </div>
                        </Col>
                        <Col
                          lg={2}
                          className="search-site-link d-flex align-items-center justify-content-center"
                        >
                          <Link
                            href={`/partners/${slugify(
                              item.category_name
                            )}/${slugify(item.title)}`}
                          >
                            Visit Website <FontAwesomeIcon icon={faSearch} />
                          </Link>
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </div>

              <Row>
                <Col>
                  {!isLoading && partnersPagination_DATA?.totalPartners > 0 && (
                    <Suspense fallback={<CustomPlaceholder />}>
                      <CustomPagination
                        totalItems={partnersPagination_DATA?.totalPartners || 0}
                        itemsPerPage={
                          partnersPagination_DATA?.perPageLimit || 0
                        }
                        activePage={parseInt(
                          partnersPagination_DATA?.currentPage || 1
                        )}
                        onPageChange={handlePageChange}
                      />
                    </Suspense>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        <Suspense fallback={<CustomPlaceholder />}>
          <SponserSites className="mt-4" />
        </Suspense>
      </div>
      <Suspense fallback={<CustomPlaceholder />}>
        <Footer className="mt-4" />
      </Suspense>{" "}
    </>
  );
};

SearchSites.propTypes = {
  // Props
  partners_DATA: PropTypes.array,
  partnersPagination_DATA: PropTypes.object,
  pageHeading_DATA: PropTypes.string,

  // Functions
  setPartnersProps_ACTION: PropTypes.func,
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  partners_DATA: state?.partnersByCategory?.searchPartnersList || [],
  partnersPagination_DATA:
    state?.partnersByCategory?.searchPartnersPagination || {},
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setPartnersProps_ACTION: setPartnersByCategoryProps,
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(SearchSites));
