"use client";

import { memo, useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  ListGroup,
  Modal,
  Row,
  useAccordionButton,
} from "react-bootstrap";
import ReactHtmlParser from "html-react-parser";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Link from "next/link";

// Custom
import {
  getCategoriesSubCategoriesAPI,
  getCategoriesPostAdsAPI,
  getCategoryAgeVerificationModalContentAPI,
  getCategoryTopSideNavLinksAPI,
  getCategorySponsersAPI,
} from "@/api/apiService";
import { slugify, unslugify, sanitizeHTML } from "@/utils/helpers";
import { ROUTES } from "@/utils/constant.js";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
// Dynamic Components
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  {
    ssr: false,
  }
);

const FixedHeader = dynamic(
  () => import("@/components/FixedHeader/index.jsx"),
  {
    ssr: false,
  }
);
const Footer = dynamic(() => import("@/components/Footer/index.jsx"), {
  ssr: false,
});
const SponserSites = dynamic(
  () => import("@/components/SponserSites/index.jsx"),
  {
    ssr: false,
  }
);

// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { setCategoriesProps as setCategoriesProps_ACTION } from "@/store/categoriesSlice";
import { setTopSideNavLinks as setTopSideNavLinks_ACTION } from "@/store/topSideNavLinksSlice";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import NextImage from "@/components/NextImage";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.categories,
  (state) => state.headSeo,
  (categories, headSeo) => ({
    categories_DATA: categories?.list || [],
    categoryPostAds_DATA: categories?.categoryPostAds || [],
    subcityContent_DATA: sanitizeHTML(categories?.subcityContent || ""),
    ageVerificationRulesModal_DATA:
      categories?.ageVerificationModalContent || {},
    pageHeading_DATA: sanitizeHTML(headSeo?.pageHeading || ""),
  })
);

const CardHeaderToggle = memo(
  ({ mainKeyId, defaultActiveKeys, children, value, onToggle = null }) => {
    const decoratedOnClick = useAccordionButton(value);

    const handleClick = useCallback(() => {
      decoratedOnClick();
      if (onToggle) onToggle(value); // Call the onToggle function passed as a prop
    }, [decoratedOnClick, value, onToggle]);

    return (
      <Card.Header
        as="div" // Explicitly set the element type
        role="button" // Add ARIA role to indicate it's a button
        id={`toggle-${mainKeyId}`} // Add ID for aria-labelledby
        aria-expanded={defaultActiveKeys.includes(value)}
        aria-controls={mainKeyId}
        onClick={handleClick}
        tabIndex={0} // Make the element focusable
        style={{ cursor: "pointer" }} // Visual cue for interactivity
      >
        {children}
      </Card.Header>
    );
  }
);

const CategoriesList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { country, city, subCity } = router.query;
  const currentPath = router.asPath;
  const { width } = useDeviceSize();
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const {
    categories_DATA,
    categoryPostAds_DATA,
    subcityContent_DATA,
    ageVerificationRulesModal_DATA,
    pageHeading_DATA,
  } = useSelector(storeSelectorData);
  //:========================================
  // States Declaration
  //:========================================
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState({
    categoriesLoader: false,
    categoryPostAdsLoader: false,
    subCityContentLoader: false,
    ageVerificationModalContentLoader: false,
  });
  const [defaultCategoryActiveKeys, setdefaultCategoryActiveKeys] = useState(
    []
  );

  //:========================================
  // Function Declaration
  //:========================================
  // Function to toggle modal visibility
  const handleShowModal = useCallback((value) => {
    setShow(value);
  }, []);
  // Function to handle acceptance
  const handleAcceptModal = useCallback(() => {
    const acceptedData = { accepted: true, sitepath: currentPath };
    localStorage.setItem("acceptAgeVerification", JSON.stringify(acceptedData));
    setShow(false);
  }, [currentPath]);
  // Close modal on rejection
  const handleRejectModal = useCallback(() => {
    localStorage.removeItem("acceptAgeVerification");
    router.push({
      pathname: ROUTES.home,
      query: { from: currentPath }, // Passing current path as state
    });
  }, []);
  // Function to handle toggling of accordion items
  const handleCategoryToggle = useCallback((key) => {
    setdefaultCategoryActiveKeys((prevKeys) => {
      if (prevKeys.includes(key)) {
        return prevKeys.filter((activeKey) => activeKey !== key); // Remove key to collapse
      }
      return [...prevKeys, key]; // Add key to expand
    });
  }, []);
  //:========================================
  // Effect Load Declaration
  //:========================================
  // Check local storage on component mount or when the route changes
  useEffect(() => {
    const storedData = localStorage.getItem("acceptAgeVerification");
    if (
      !isLoading.ageVerificationModalContentLoader &&
      ageVerificationRulesModal_DATA?.content
    ) {
      const { accepted, sitepath } = JSON.parse(storedData || "{}");
      // Show or hide modal based on stored acceptance and current path
      setShow(storedData ? !accepted || currentPath !== sitepath : true);
    }
  }, [currentPath, isLoading, ageVerificationRulesModal_DATA]);
  useEffect(() => {
    const fetchAPI = async () => {
      // Set all loaders to true
      setIsLoading({
        categoriesLoader: true,
        categoryPostAdsLoader: true,
        subCityContentLoader: true,
        ageVerificationModalContentLoader: true,
      });
      try {
        // Fetch all APIs concurrently
        const [
          categoriesResponse,
          ageVerificationResponse,
          postAdsResponse,
          topSideNavResponse,
          sponsersResponse,
        ] = await Promise.all([
          getCategoriesSubCategoriesAPI(
            unslugify(country),
            unslugify(city),
            unslugify(subCity)
          ).catch((error) => {
            console.error("Error in getCategoriesSubCategoriesAPI:", error);
            return null;
          }),
          getCategoryAgeVerificationModalContentAPI().catch((error) => {
            console.error(
              "Error in getCategoryAgeVerificationModalContentAPI:",
              error
            );
            return null;
          }),
          getCategoriesPostAdsAPI().catch((error) => {
            console.error("Error in getCategoriesPostAdsAPI:", error);
            return null;
          }),
          getCategoryTopSideNavLinksAPI().catch((error) => {
            console.error("Error in getCategoryTopSideNavLinksAPI:", error);
            return null;
          }),
          getCategorySponsersAPI({ deviceWidth: width }).catch((error) => {
            console.error("Error in getCategorySponsersAPI:", error);
            return null;
          }),
        ]);
        // Process responses if available
        if (categoriesResponse) {
          const { list, subcityContent } = categoriesResponse;
          dispatch(setCategoriesProps_ACTION({ key: "list", data: list }));
          dispatch(
            setCategoriesProps_ACTION({
              key: "subcityContent",
              data: subcityContent,
            })
          );
        }
        if (ageVerificationResponse) {
          dispatch(
            setCategoriesProps_ACTION({
              key: "ageVerificationModalContent",
              data: ageVerificationResponse,
            })
          );
        }
        if (postAdsResponse) {
          dispatch(
            setCategoriesProps_ACTION({
              key: "categoryPostAds",
              data: postAdsResponse,
            })
          );
        }
        if (topSideNavResponse) {
          dispatch(setTopSideNavLinks_ACTION(topSideNavResponse));
        }
        if (sponsersResponse) {
          dispatch(setSponsers_ACTION(sponsersResponse));
        }
      } catch (error) {
        console.error("Failed to fetch APIs:", error);
      } finally {
        // Set all loaders to false
        setIsLoading({
          categoriesLoader: false,
          categoryPostAdsLoader: false,
          subCityContentLoader: false,
          ageVerificationModalContentLoader: false,
        });
      }
    };
    fetchAPI();
  }, [country, city, subCity, width, dispatch, setIsLoading]);
  // Update states when countries_DATA changes
  useEffect(() => {
    setdefaultCategoryActiveKeys(categories_DATA.map((_) => `${_.id}`));
  }, [categories_DATA]);

  return (
    <>
      <div className="postCategoriesPage">
        <FixedHeader />
        <div className="pageWrapper">
          <div className="categoriesList">
            <Container className="ctlst-cnt">
              <Row className="justify-content-center align-items-center">
                <Col className="text-center">
                  {ReactHtmlParser(pageHeading_DATA || "")}
                  {pageHeading_DATA?.data && (
                    <h4 className="heading">
                      Welcome To Localxlist {unslugify(city)},{" "}
                      {unslugify(subCity)} area!
                    </h4>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Breadcrumb className="breadcrumb-area">
                    <Breadcrumb.Item active>
                      {unslugify(country)}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>{unslugify(city)}</Breadcrumb.Item>
                    <Breadcrumb.Item active>
                      {unslugify(subCity)}
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </Col>
              </Row>

              {(isLoading.categoriesLoader && categories_DATA.length == 0) ||
              (categories_DATA.length > 0 &&
                defaultCategoryActiveKeys.length === 0) ? (
                <Row className="mt-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Col lg={3} key={index}>
                      {/* Categories */}
                      <Accordion
                        activeKey={Array.from({ length: 4 }).map(
                          (_, index) => `${index}`
                        )}
                      >
                        <Card>
                          <CardHeaderToggle
                            defaultActiveKeys={defaultCategoryActiveKeys}
                            mainKeyId={index}
                            value={`${index}`}
                            onToggle={handleCategoryToggle}
                          >
                            <CustomPlaceholder
                              as="h2"
                              className="category_title"
                            />
                          </CardHeaderToggle>
                          <Accordion.Collapse eventKey={`${index}`}>
                            <Card.Body>
                              {/* Sub Category */}
                              <ListGroup
                                style={{
                                  maxHeight: "250px",
                                  overflowY: "auto",
                                }}
                              >
                                {Array.from({ length: 5 }).map((_, index2) => (
                                  <ListGroup.Item
                                    key={`${index2}`}
                                    className="item-bottom-border mb-1"
                                  >
                                    <CustomPlaceholder
                                      as="h2"
                                      className="subCategory_title"
                                    />
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>
                      </Accordion>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Row className="mt-3">
                  {categories_DATA.map((category) => (
                    <Col lg={3} key={`${category?.id}`}>
                      {/* Categories */}
                      <Accordion
                        activeKey={defaultCategoryActiveKeys}
                        alwaysOpen
                      >
                        <Card>
                          <CardHeaderToggle
                            defaultActiveKeys={defaultCategoryActiveKeys}
                            mainKeyId={`country-${category.id}`}
                            value={`${category?.id}`}
                            onToggle={handleCategoryToggle}
                          >
                            <h2 className="category_title">
                              {category?.category}{" "}
                            </h2>
                          </CardHeaderToggle>
                          <Accordion.Collapse eventKey={`${category?.id}`}>
                            <Card.Body>
                              {/* Sub Category */}
                              <ListGroup
                                style={{
                                  maxHeight: "250px",
                                  overflowY: "auto",
                                }}
                              >
                                {category?.subcategories.map((subCategory) => (
                                  <ListGroup.Item
                                    key={subCategory?.id}
                                    className="item-bottom-border"
                                  >
                                    <Link
                                      href={`/p/${country}/${city}/${subCity}/categories/${slugify(
                                        category?.category
                                      )}/${slugify(
                                        subCategory?.subcategory
                                      )}/post-list`}
                                    >
                                      <h2 className="subCategory_title">
                                        {subCategory?.subcategory}
                                      </h2>
                                    </Link>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>
                      </Accordion>
                    </Col>
                  ))}
                </Row>
              )}

              <Row className="mt-3">
                {isLoading.categoryPostAdsLoader &&
                categoryPostAds_DATA.length === 0 ? (
                  <>
                    {Array.from({ length: 1 }).map((_, index) => (
                      <Col lg={12} key={index} className="text-center">
                        <CustomPlaceholder outerStyle={{ height: "40px" }} />
                      </Col>
                    ))}
                  </>
                ) : (
                  <>
                    {categoryPostAds_DATA.map((ads) => (
                      <Col lg={12} key={ads.id}>
                        <div className="ads-banner">
                          <a
                            href={ads?.target_url}
                            target={ads?.target_blank ? "_blank" : undefined}
                            rel={
                              ads?.target_blank
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            <NextImage
                              src={ads?.path} // Use dynamic src with fallback
                              alt={ads?.title || "Advertisement"}
                              width={0} // Intrinsic width
                              height={0} // Intrinsic height
                              sizes="(max-width: 768px) 100vw, 728px" // Add for responsive optimization
                              quality={85}
                              style={{
                                width: "100%", // Scale to container
                                height: "auto", // Maintain aspect ratio
                                objectFit: "contain", // Prevent distortion
                                minHeight: "90px", // Minimum height
                                maxHeight: "250px", // Maximum height
                              }}
                              // unoptimized // Uncomment only if optimization fails
                            />
                          </a>
                        </div>
                        {/* <a
                          href={ads?.target_url}
                          target={ads?.target_blank ? "_blank" : undefined} // Use undefined instead of not setting it
                          rel={
                            ads?.target_blank
                              ? "noopener noreferrer"
                              : undefined
                          } // Added for safety
                        >
                          <LazyImage
                            className="img-fluid"
                            src={ads?.path}
                            alt={ads?.title || "ads"}
                            isDynamic={false}
                          />
                        </a> */}
                      </Col>
                    ))}
                  </>
                )}
              </Row>

              {isLoading.subCityContentLoader && !subcityContent_DATA ? (
                <CustomPlaceholder outerStyle={{ height: "100px" }} />
              ) : (
                subcityContent_DATA && (
                  <Row className="px-3 py-2 mt-4">
                    <Col className="about_section">
                      {ReactHtmlParser(subcityContent_DATA)}
                    </Col>
                  </Row>
                )
              )}
            </Container>
            <SponserSites className="mt-4" />
          </div>
        </div>
        <Footer className="mt-4" />
        <Modal
          show={show}
          onHide={() => handleShowModal(false)}
          backdrop="static"
          keyboard={false}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          className="age-verification-modal"
          centered
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              {isLoading.ageVerificationModalContentLoader &&
              !sanitizeHTML(ageVerificationRulesModal_DATA?.title || "") ? (
                <CustomPlaceholder as="div" outerStyle={{ width: "100px" }} />
              ) : (
                <>
                  {ReactHtmlParser(
                    sanitizeHTML(ageVerificationRulesModal_DATA?.title || "")
                  )}
                </>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoading.ageVerificationModalContentLoader &&
            !sanitizeHTML(ageVerificationRulesModal_DATA?.content || "") ? (
              <>
                <CustomPlaceholder />
                <CustomPlaceholder />
                <CustomPlaceholder />
              </>
            ) : (
              <>
                {ReactHtmlParser(
                  sanitizeHTML(ageVerificationRulesModal_DATA?.content || "")
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            {isLoading.ageVerificationModalContentLoader &&
            !sanitizeHTML(ageVerificationRulesModal_DATA?.title || "") &&
            !sanitizeHTML(ageVerificationRulesModal_DATA?.content || "") ? (
              <>
                <CustomPlaceholder type="button" variant="success" />
                <CustomPlaceholder type="button" variant="danger" />
              </>
            ) : (
              <>
                <Button variant="success" onClick={handleAcceptModal}>
                  I accept
                </Button>
                <Button variant="danger" onClick={handleRejectModal}>
                  I reject
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

CardHeaderToggle.displayName = "CardHeaderToggle";
CardHeaderToggle.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  mainKeyId: PropTypes.number,
  defaultActiveKeys: PropTypes.arrayOf(PropTypes.string), // Array of strings
};

export default memo(CategoriesList);
