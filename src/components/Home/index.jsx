"use client";
import { memo, useCallback, useEffect, useState, startTransition, Suspense } from "react";
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
// Removed unused API imports
import { sanitizeHTML, slugify } from "@/utils/helpers";
import useAuth from "@/customHooks/useAuth.js";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant.js";
// Dynamic Components with proper loading fallbacks
const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
  loading: () => <div style={{ width: '300px', height: '77px', backgroundColor: '#f0f0f0' }} />
});
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '50px', backgroundColor: '#f0f0f0' }} />
  }
);
const SponserSites = dynamic(
  () => import("@/components/SponserSites/index.jsx"),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
  }
);
const Partners = dynamic(() => import("@/components/Partners/index.jsx"), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
});
const Footer = dynamic(() => import("@/components/Footer/index.jsx"), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
});
const LazyContent = dynamic(
  () => import("@/components/CustomLazyLoadContent"),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '50px', backgroundColor: '#f0f0f0' }} />
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
  mainKeyId: PropTypes.any,
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
    // Temporarily disable viewport rendering to fix hydration issues
    // const { visibleItems, containerRef } = useViewportRendering(countries_DATA || [], {
    //   initialRender: 3,
    //   batchSize: 5,
    // });

    if (!countries_DATA || countries_DATA.length === 0) {
      return <div className="empty-countries">No countries data available</div>;
    }

    return (
      <div className="countries-container">
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
      </div>
    );
  }
);
// Client-only wrapper component
const ClientOnly = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return <>{children}</>;
};

const Home = ({ initialData = null }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { width, isMobile } = useDeviceSize();
  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { countries_DATA, dashboardContent_DATA, topNotice_DATA, logo_DATA } =
    useSelector(homeSelectorData);
  
  // Use initialData as fallback if Redux state is empty
  const getCountriesArray = (countries) => {
    if (!countries) return [];
    if (Array.isArray(countries)) return countries;
    if (countries.list && Array.isArray(countries.list)) return countries.list;
    return [];
  };
  
  const finalCountriesData = countries_DATA?.length > 0 
    ? countries_DATA 
    : getCountriesArray(initialData?.countries);
  const finalDashboardContent = dashboardContent_DATA || initialData?.dashboardContent || "";
  const finalTopNotice = topNotice_DATA || initialData?.topNotice || "";
  const finalLogo = logo_DATA || initialData?.headLogo || "/images/logo.png";
  
  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  
  // Debug logging
  console.log('Home component render:', {
    initialData: initialData,
    countries_DATA: countries_DATA,
    finalCountriesData: finalCountriesData,
    isLoading: isLoading,
    initialDataCountries: initialData?.countries,
    initialDataLength: initialData?.countries?.length
  });
  const [defaultCountryActiveKeys, setDefaultCountryActiveKeys] = useState([]);
  const [defaultCityActiveKeys, setDefaultCityActiveKeys] = useState([]);
  const [_hasCountryKeys, setHasCountryKeys] = useState(false);
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
  
  // Hydration effect - runs only on client side
  useEffect(() => {
    // Use a timeout to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsHydrating(false);
      setIsHydrated(true);
    }, 100); // Small delay to ensure hydration is complete
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only run after hydration is complete
    if (isHydrating) return;
    
    // Use initial data from getStaticProps instead of API calls
    if (initialData) {
      console.log('Dispatching initial data:', initialData); // Debug log
      
      // Wrap dispatch calls in startTransition to prevent hydration issues
      startTransition(() => {
        dispatch(
          setHomeProps_ACTION({ key: "topNotice", data: initialData.topNotice || "" })
        );
        dispatch(
          setHomeProps_ACTION({
            key: "countries",
            data: initialData.countries || [],
          })
        );
        dispatch(
          setHomeProps_ACTION({
            key: "dashboardContent",
            data: initialData.dashboardContent || "",
          })
        );
        dispatch(setPartners_ACTION(initialData.partners || []));
        dispatch(setSponsers_ACTION(initialData.sponsers || []));
        dispatch(
          setPageProps_ACTION({ key: "pageSettings", data: initialData.pageSettings })
        );
        setIsLoading(false);
      });
    }
  }, [initialData, dispatch, isHydrating]);

  // Initialize loading state based on initial data
  useEffect(() => {
    // Only run after hydration is complete
    if (isHydrating) return;
    
    startTransition(() => {
      if (initialData) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    });
  }, [initialData, isHydrating]);
  useEffect(() => {
    // Only run on client side and after hydration is complete
    if (typeof window === 'undefined' || isHydrating) return;
    
    // Use startTransition to prevent hydration boundary issues
    startTransition(() => {
      // Use a more conservative approach for initial state
      const shouldExpandAll = width > 1024; // More explicit than isDesktop
      
      setDefaultCountryActiveKeys(
        shouldExpandAll ? finalCountriesData.map((country) => `${country.id}`) : []
      );
      setDefaultCityActiveKeys(
        shouldExpandAll
          ? finalCountriesData.flatMap((country) =>
              country.cities.map((city) => `${city.id}`)
            )
          : []
      );
      if (finalCountriesData.length) setHasCountryKeys(true);
    });
  }, [finalCountriesData, width, isHydrating]);
  return (
    <Suspense fallback={
      <div className="homePage">
        <div className="pageWrapper">
          <Container className="home-cnt">
            <Row>
              <Col>
                <div className="d-flex justify-content-center">
                  <div style={{ width: '300px', height: '77px', backgroundColor: '#f0f0f0' }} />
                </div>
                <div style={{ minHeight: '50px', backgroundColor: '#f0f0f0' }} />
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
                  <span>My Account</span>
                  <span className="separator">|</span>
                  <span>Post Ad</span>
                </div>
              </Col>
            </Row>
            <div style={{ minHeight: '200px', backgroundColor: '#f0f0f0' }} />
            <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
          </Container>
          <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
          <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
        </div>
        <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
      </div>
    }>
      <ClientOnly fallback={
        <div className="homePage">
          <div className="pageWrapper">
            <Container className="home-cnt">
              <Row>
                <Col>
                  <div className="d-flex justify-content-center">
                    <div style={{ width: '300px', height: '77px', backgroundColor: '#f0f0f0' }} />
                  </div>
                  <div style={{ minHeight: '50px', backgroundColor: '#f0f0f0' }} />
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
                    <span>My Account</span>
                    <span className="separator">|</span>
                    <span>Post Ad</span>
                  </div>
                </Col>
              </Row>
              <div style={{ minHeight: '200px', backgroundColor: '#f0f0f0' }} />
              <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
            </Container>
            <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
            <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
          </div>
          <div style={{ minHeight: '100px', backgroundColor: '#f0f0f0' }} />
        </div>
      }>
        <div className="homePage">
          <div className="pageWrapper">
            <Container className="home-cnt">
              <Row>
                <Col>
                  <div className="d-flex justify-content-center">
                    <Link href={ROUTES.home} className="brand-logo">
                      <NextImage
                        src={finalLogo}
                        alt="Logo"
                        width={300}
                        height={77}
                        aspectRatio={"300/77"}
                        priority={true}
                        quality={75}
                        style={{ 
                          width: '300px', 
                          height: '77px',
                          display: 'block'
                        }}
                      />
                    </Link>
                  </div>
                  <div className="home-top-notice" style={{ minHeight: '50px' }}>
                    {isHydrating || !isHydrated || (isLoading && !finalTopNotice) ? (
                      <CustomPlaceholder style={{ minHeight: '50px' }} />
                    ) : (
                      <LazyContent
                        height={"50px"}
                        content={ReactHtmlParser(finalTopNotice)}
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
              <div className="countries-dir" style={{ minHeight: '200px' }}>
                {isHydrating || !isHydrated || (isLoading && finalCountriesData.length === 0) ? (
                  <div className="loading-placeholder">
                    <CustomPlaceholder outerStyle={{ height: "200px" }} />
                  </div>
                ) : (
                  <CountriesDir
                    defaultCountryActiveKeys={defaultCountryActiveKeys}
                    defaultCityActiveKeys={defaultCityActiveKeys}
                    countries_DATA={finalCountriesData}
                    handleCountryToggle={handleCountryToggle}
                    handleCityToggle={handleCityToggle}
                  />
                )}
              </div>
              <div className="about-section" style={{ minHeight: '120px', containIntrinsicSize: '120px' }}>
                {isHydrating || !isHydrated || (isLoading && !finalDashboardContent) ? (
                  <div style={{ height: '120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <CustomPlaceholder className="mb-1" style={{ height: '20px', minHeight: '20px' }} />
                    <CustomPlaceholder className="mb-1" style={{ height: '20px', minHeight: '20px' }} />
                    <CustomPlaceholder className="mb-1" style={{ height: '20px', minHeight: '20px' }} />
                    <CustomPlaceholder className="mb-1" style={{ height: '20px', minHeight: '20px' }} />
                  </div>
                ) : (
                  <LazyContent
                    height={"100px"}
                    content={ReactHtmlParser(finalDashboardContent)}
                  />
                )}
              </div>
            </Container>
            <Partners className="mt-4" />
            <SponserSites className="mt-4" />
          </div>
          <Footer className="bottom-fixed home-footer mt-4" />
        </div>
      </ClientOnly>
    </Suspense>
  );
};
Home.propTypes = {
  initialData: PropTypes.shape({
    topNotice: PropTypes.string,
    countries: PropTypes.array,
    dashboardContent: PropTypes.string,
    partners: PropTypes.array,
    sponsers: PropTypes.array,
    pageSettings: PropTypes.object,
  }),
};

export default memo(Home);
