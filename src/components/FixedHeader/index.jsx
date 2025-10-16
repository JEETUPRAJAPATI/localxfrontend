import { Fragment, memo, useState, useCallback, useEffect } from "react";
import { Col, Container, Nav, Navbar, Offcanvas, Row } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";

// Custom
import { getPageCommonSettingsAPI } from "@/api/apiService.js";

import useAuth from "@/customHooks/useAuth.js";
import { logout } from "@/utils/auth.js";
import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant.js";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { setPageProps_ACTION } from "@/store/pageSlice";
// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.topSideNavLinks,
  (state) => state.headSeo,
  (state) => state.page,
  (topSideNavLinks, headSeo, page) => ({
    topSideNavLinks_DATA: topSideNavLinks || [],
    logo_DATA: headSeo?.image || "/images/logo.png",
    pageSettings_DATA: page?.pageSettings || {},
  })
);
import NextImage from "@/components/NextImage";
const FixedHeader = () => {
  const dispatch = useDispatch();

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { topSideNavLinks_DATA, logo_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [showOffCanvas, setShowOffCanvas] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================
  const handleClose = useCallback(() => {
    setShowOffCanvas(false);
  }, [showOffCanvas]);
  const handleShow = useCallback(() => {
    setShowOffCanvas(true);
  }, [showOffCanvas]);

  const handleLogout = (e) => {
    e.preventDefault(); // Prevents the default navigation
    logout();
    router.replace(ROUTES.login);
  };

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        getPageCommonSettingsAPI()
          .then((data) =>
            dispatch(setPageProps_ACTION({ key: "pageSettings", data }))
          )
          .catch((error) => {
            console.error("Error in getPageCommonSettingsAPI:", error);
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
      <Navbar expand="false" fixed="top" className="fixedHeader">
        <Container fluid>
          <Row className="d-flex align-items-center w-100 m-0 justify-content-between">
            <Col className="d-flex align-items-center">
              <Navbar.Toggle
                className="toggle_top_nav"
                aria-controls={`offcanvasNavbar-expand-${false}`}
                onClick={handleShow}
              />
              <Navbar.Brand>
                <Link href={ROUTES.home} className="brand-logo">
                  <NextImage
                    src={logo_DATA}
                    alt="Logo"
                    width={200}
                    height={51}
                    priority
                    quality={75}
                  />
                </Link>
              </Navbar.Brand>
            </Col>
            <Col className="d-flex align-items-center justify-content-end right-menu">
              <Link
                href={
                  isAuthenticated
                    ? CREATE_POST_STEPS_USER_PANEL[0]?.route || ""
                    : ROUTES.login
                }
                prefetch={false}
                className="btn btn-primary me-2"
              >
                Post Ad
              </Link>
              <Link
                prefetch={false}
                href={isAuthenticated ? ROUTES.userDashboardMain : ROUTES.login}
                className="btn btn-primary me-2"
              >
                My Account
              </Link>
            </Col>
          </Row>
          {showOffCanvas && (
            <Navbar.Offcanvas
              show={showOffCanvas}
              placement="start"
              className="fixedCanvasSidebar"
              onHide={handleClose}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${false}`}>
                  <Link href={ROUTES.home} className="brand-logo">
                    <NextImage
                      src={logo_DATA}
                      alt="Logo"
                      width={182}
                      height={47}
                      priority
                      quality={75}
                    />
                  </Link>
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="flex-column align-items-center">
                  <Link
                    href={
                      isAuthenticated
                        ? CREATE_POST_STEPS_USER_PANEL[0]?.route || ""
                        : ROUTES.login
                    }
                    className="offcanvas-link"
                  >
                    Post Ad
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <div className="divider"></div>
                      <Link
                        href={ROUTES.home}
                        onClick={handleLogout}
                        className="offcanvas-link"
                      >
                        Logout
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="divider"></div>
                      <Link href={ROUTES.login} className="offcanvas-link">
                        Login
                      </Link>
                      <div className="divider"></div>
                      <Link href={ROUTES.signup} className="offcanvas-link">
                        Registration
                      </Link>
                    </>
                  )}

                  {topSideNavLinks_DATA.map((nav, index) => (
                    <Fragment key={index}>
                      <div className="divider"></div>
                      <a href={nav.url} className="offcanvas-link">
                        {nav.text}
                      </a>
                    </Fragment>
                  ))}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          )}
        </Container>
      </Navbar>
    </>
  );
};

export default memo(FixedHeader);
