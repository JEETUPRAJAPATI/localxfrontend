"use client";
import { memo, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  useAccordionButton,
} from "react-bootstrap";
import ReactHtmlParser from "html-react-parser";
import dynamic from "next/dynamic";
import Link from "next/link";
// Custom
import {
  getHomeCountriesAPI,
  getHomeDashboardContentAPI,
  getHomeTopNoticeAPI,
  getHomePartnersAPI,
  getHomeSponsersAPI,
  getPageCommonSettingsAPI,
} from "@/api/apiService";
import { sanitizeHTML, slugify } from "@/utils/helpers";
import useAuth from "@/customHooks/useAuth.js";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant.js";
// Dynamic Components
const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
});
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  {
    ssr: false,
  }
);
const SponserSites = dynamic(
  () => import("@/components/SponserSites/index.jsx"),
  {
    ssr: false,
  }
);
const Partners = dynamic(() => import("@/components/Partners/index.jsx"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer/index.jsx"), {
  ssr: false,
});
const LazyContent = dynamic(
  () => import("@/components/CustomLazyLoadContent"),
  {
    ssr: false,
  }
);
// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { setHomeProps_ACTION } from "@/store/homeSlice";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setPartners_ACTION } from "@/store/partnersSlice";
import { setPageProps_ACTION } from "@/store/pageSlice";
// Single memoized selector for Redux state
const homeSelectorData = createSelector(
  (state) => state.home,
  (state) => state.page,
  (state) => state.headSeo,
  (home, page, headSeo) => ({
    topNotice_DATA: sanitizeHTML(headSeo?.pageHeading || home?.topNotice || ""),
    countries_DATA: home?.countries || [],
    dashboardContent_DATA: sanitizeHTML(home?.dashboardContent || ""),
    pageSettings_DATA: page?.pageSettings || {},
    logo_DATA: headSeo?.image || "/images/logo.png",
  })
);
const CardHeaderToggle = memo(
  ({ mainKeyId, defaultActiveKeys, children, value, onToggle = null }) => {
    const decoratedOnClick = useAccordionButton(value);

    const handleClick = useCallback(() => {
      decoratedOnClick();
      if (onToggle) onToggle(value);
    }, [decoratedOnClick, value, onToggle]);

    return (
      <Card.Header
        as="div" // Explicitly set the element type
        role="button" // Add ARIA role to indicate it's a button
        id={`toggle-${mainKeyId}`} // Add ID for aria-labelledby
        aria-expanded={defaultActiveKeys.includes(value)}
        aria-controls={mainKeyId}
        onClick={handleClick}
        onKeyDown={(e) => {
          // Add keyboard accessibility
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0} // Make the element focusable
        style={{ cursor: "pointer" }} // Visual cue for interactivity
      >
        {children}
      </Card.Header>
    );
  }
);
CardHeaderToggle.displayName = "CardHeaderToggle";
CardHeaderToggle.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  mainKeyId: PropTypes.number,
  defaultActiveKeys: PropTypes.arrayOf(PropTypes.string), // Array of strings
};
const CountriesDir = memo(
  ({
    defaultCountryActiveKeys,
    defaultCityActiveKeys,
    countries_DATA,
    handleCountryToggle,
    handleCityToggle,
  }) => {
    return (
      <Accordion activeKey={defaultCountryActiveKeys} alwaysOpen>
        {countries_DATA.map((countryData) => (
          <Card key={`${countryData.id}`}>
            <CardHeaderToggle
              defaultActiveKeys={defaultCountryActiveKeys}
              mainKeyId={`country-${countryData.id}`}
              value={`${countryData.id}`}
              onToggle={handleCountryToggle}
            >
              <h2 className="country-title">{countryData.country}</h2>
            </CardHeaderToggle>
            <Accordion.Collapse eventKey={`${countryData.id}`}>
              <Card.Body className="cities-container">
                {countryData.cities.map((cityData) => (
                  <div className="city-card" key={`${cityData.id}`}>
                    <Accordion activeKey={defaultCityActiveKeys}>
                      <Card>
                        <CardHeaderToggle
                          defaultActiveKeys={defaultCityActiveKeys}
                          mainKeyId={`city-${cityData.id}`}
                          value={`${cityData.id}`}
                          onToggle={handleCityToggle}
                        >
                          <h2 className="city-title">{cityData.city}</h2>
                        </CardHeaderToggle>
                        <Accordion.Collapse eventKey={`${cityData.id}`}>
                          <Card.Body>
                            <ListGroup>
                              {cityData.subcities.map((suburb) => (
                                <ListGroup.Item key={suburb.id}>
                                  <Link
                                    href={`/s/${slugify(
                                      countryData.country
                                    )}/${slugify(cityData.city)}/${slugify(
                                      suburb.subcity
                                    )}`}
                                  >
                                    <h2 className="subcity-title">
                                      {suburb.subcity}
                                    </h2>
                                  </Link>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                  </div>
                ))}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
      </Accordion>
    );
  }
);
const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { width, isDesktop, isMobile } = useDeviceSize();
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { countries_DATA, dashboardContent_DATA, topNotice_DATA, logo_DATA } =
    useSelector(homeSelectorData);
  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  const [defaultCountryActiveKeys, setDefaultCountryActiveKeys] = useState([]);
  const [defaultCityActiveKeys, setDefaultCityActiveKeys] = useState([]);
  const [hasCountryKeys, setHasCountryKeys] = useState(false);
  //:========================================
  // Function Declaration
  //:========================================
  const handleCountryToggle = useCallback(
    (key) => {
      setDefaultCountryActiveKeys((prevKeys) => {
        if (prevKeys.includes(key)) {
          // Remove key to collapse
          const expandedCountriesKeys = prevKeys.filter(
            (activeKey) => activeKey !== key
          );

          if (isMobile) {
            // Collapse all cities under the speicific country
            const cityKeys = countries_DATA
              .find((country) => country.id == key)
              ?.cities.map((city) => `${city.id}`);
            // Remove city keys from the active cities keys
            setDefaultCityActiveKeys(
              (prevCityKeys) =>
                prevCityKeys.filter(
                  (activeKey) => !cityKeys?.includes(activeKey)
                ) || []
            );
          }

          return expandedCountriesKeys || [];
        }
        return [...prevKeys, key]; // Add key to expandedCountriesKeys
      });
    },
    [countries_DATA, isMobile]
  );
  const handleCityToggle = useCallback((key) => {
    setDefaultCityActiveKeys(
      (prevKeys) =>
        prevKeys.includes(key)
          ? prevKeys.filter((activeKey) => activeKey !== key)
          : [...prevKeys, key] //expandedCitiesKeys
    );
  }, []);
  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    const fetchAPI = async () => {
      setIsLoading(true);
      try {
        const [
          topNotice,
          countries,
          dashboardContent,
          partners,
          sponsers,
          pageSettings,
        ] = await Promise.all([
          getHomeTopNoticeAPI().catch((error) =>
            console.error("Error in getHomeTopNoticeAPI:", error)
          ),
          getHomeCountriesAPI().catch((error) =>
            console.error("Error in getHomeCountriesAPI:", error)
          ),
          getHomeDashboardContentAPI(),
          getHomePartnersAPI(),
          getHomeSponsersAPI({ deviceWidth: width }),
          getPageCommonSettingsAPI(),
        ]);

        dispatch(
          setHomeProps_ACTION({ key: "topNotice", data: topNotice || "" })
        );
        dispatch(
          setHomeProps_ACTION({
            key: "countries",
            data: countries || [],
          })
        );
        dispatch(
          setHomeProps_ACTION({
            key: "dashboardContent",
            data: dashboardContent || "",
          })
        );
        dispatch(setPartners_ACTION(partners || []));
        dispatch(setSponsers_ACTION(sponsers || []));
        dispatch(
          setPageProps_ACTION({ key: "pageSettings", data: pageSettings })
        );
      } catch (error) {
        console.error("Failed to fetch API:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAPI();
  }, []);
  useEffect(() => {
    setDefaultCountryActiveKeys(
      isDesktop ? countries_DATA.map((country) => `${country.id}`) : []
    );
    setDefaultCityActiveKeys(
      isDesktop
        ? countries_DATA.flatMap((country) =>
            country.cities.map((city) => `${city.id}`)
          )
        : []
    );
    if (countries_DATA.length) setHasCountryKeys(true);
  }, [countries_DATA, isDesktop]);
  return (
    <>
      <div className="homePage">
        <div className="pageWrapper">
          <Container className="home-cnt">
            <Row>
              <Col>
                <div className="d-flex justify-content-center">
                  <Link href={ROUTES.home} className="brand-logo">
                    <NextImage
                      src={logo_DATA}
                      alt="Logo"
                      width={300}
                      height={77}
                      aspectRatio={"300/77"}
                      priority={true}
                      quality={75}
                    />
                  </Link>
                </div>
                <div className="home-top-notice">
                  {isLoading && !topNotice_DATA ? (
                    <CustomPlaceholder />
                  ) : (
                    <LazyContent
                      height={"10px"}
                      content={ReactHtmlParser(topNotice_DATA)}
                    />
                  )}
                </div>
              </Col>
            </Row>
            <Row className="g-1 g-md-2 nav-row">
              <Col>
                <div className="choose-location-nav top-nav">
                  <small>Choose a location:</small>
                </div>
              </Col>
              <Col>
                <div className="my-account-nav text-end top-nav">
                  <Link
                    href={isAuthenticated ? ROUTES.userDashboard : ROUTES.login}
                    className="account-link"
                  >
                    My Account
                  </Link>
                  <span className="separator">|</span>
                  <Link
                    href={
                      isAuthenticated
                        ? CREATE_POST_STEPS_USER_PANEL[0]?.route || ""
                        : ROUTES.login
                    }
                    className="account-link"
                  >
                    Post Ad
                  </Link>
                </div>
              </Col>
            </Row>
            <div className="countries-dir">
              {(isLoading && countries_DATA.length === 0) ||
              (isDesktop && !hasCountryKeys) ? (
                <Accordion
                  activeKey={Array.from({ length: isMobile ? 5 : 1 }).map(
                    (_, index) => `${index}`
                  )}
                >
                  {Array.from({ length: isMobile ? 5 : 1 }).map((_, index) => (
                    <Card key={`${index}`}>
                      <CustomPlaceholder
                        as="h2"
                        className="country-title mb-2"
                        outerStyle={{ height: "30px" }}
                      />
                      {isDesktop && (
                        <Accordion.Collapse eventKey={`${index}`}>
                          <Card.Body className="cities-container">
                            {Array.from({ length: isMobile ? 1 : 4 }).map(
                              (_, index2) => (
                                <div className="city-card" key={`${index2}`}>
                                  {/* Cities */}
                                  <Accordion
                                    activeKey={Array.from({
                                      length: isMobile ? 1 : 4,
                                    }).map((_, index2) => `${index2}`)}
                                  >
                                    <Card>
                                      <CustomPlaceholder
                                        as="h2"
                                        className="city-title mb-2"
                                        outerStyle={{ height: "25px" }}
                                      />
                                      <Accordion.Collapse
                                        eventKey={`${index2}`}
                                      >
                                        <Card.Body>
                                          {/* Subcity */}
                                          <ListGroup>
                                            {Array.from({
                                              length: isMobile ? 5 : 3,
                                            }).map((_, index3) => (
                                              <ListGroup.Item key={index3}>
                                                <CustomPlaceholder
                                                  outerStyle={{
                                                    width: "100%",
                                                  }}
                                                />
                                              </ListGroup.Item>
                                            ))}
                                          </ListGroup>
                                        </Card.Body>
                                      </Accordion.Collapse>
                                    </Card>
                                  </Accordion>
                                </div>
                              )
                            )}
                          </Card.Body>
                        </Accordion.Collapse>
                      )}
                    </Card>
                  ))}
                </Accordion>
              ) : (
                <CountriesDir
                  defaultCountryActiveKeys={defaultCountryActiveKeys}
                  defaultCityActiveKeys={defaultCityActiveKeys}
                  countries_DATA={countries_DATA}
                  handleCountryToggle={handleCountryToggle}
                  handleCityToggle={handleCityToggle}
                />
              )}
            </div>
            <div className="about-section">
              {isLoading && !dashboardContent_DATA ? (
                <>
                  <CustomPlaceholder className="mb-1" />
                  <CustomPlaceholder className="mb-1" />
                  <CustomPlaceholder className="mb-1" />
                  <CustomPlaceholder className="mb-1" />
                </>
              ) : (
                <LazyContent
                  height={"100px"}
                  content={ReactHtmlParser(dashboardContent_DATA)}
                />
              )}
            </div>
          </Container>
          <Partners className="mt-4" />
          <SponserSites className="mt-4" />
        </div>
        <Footer className="bottom-fixed home-footer mt-4" />
      </div>
    </>
  );
};
export default memo(Home);
