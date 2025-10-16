import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Navbar,
  Offcanvas,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  faMoneyBill1 as faMoneyBill,
  faNewspaper,
} from "@fortawesome/free-regular-svg-icons";
import {
  faCogs,
  faComment,
  faDeleteLeft,
  faSignOutAlt,
  faTachometer,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { login, logout } from "@/utils/auth.js";
import { getUserProfileAPI, updateUsernameAPI } from "@/api/apiAuthService.js";
import { CREATE_POST_STEPS_USER_PANEL, ROUTES } from "@/utils/constant.js";
import { updateUsernameFormSchema } from "@/utils/yupValidationSchema.js";
import { sanitizeFields } from "@/utils/helpers.js";
import { Formik } from "formik";
import { getPageCommonSettingsAPI } from "@/api/apiService.js";
import { setPageProps_ACTION } from "@/store/pageSlice.js";
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import NextImage from "@/components/NextImage";
import NotificationBell from "@/components/NotificationBell";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.headSeo,
  (state) => state.auth,
  (state) => state.page,
  (headSeo, auth, page) => ({
    logo_DATA: headSeo?.image || "/images/logo.png",

    profile_DATA: auth?.user?.profile || {},
    pageSettings_DATA: page?.pageSettings || {},
  })
);

// Dynamic Components
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});

const FixedAuthHeader = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { actionType } = router.query;
  const currentLocationPath = router.asPath;

  const postActionDetail = CREATE_POST_STEPS_USER_PANEL.find(
    (item) => item.actionType === actionType
  );

  const isPostRoute = currentLocationPath.startsWith(
    `${ROUTES.userDashboardMain}/post`
  );
  const currentRoutePath = currentLocationPath || "";

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { logo_DATA, profile_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const [showSetUsernameModal, setSetUsernameModal] = useState(false);
  const [profileUsernameFormInitialValues] = useState({
    username: "",
  });

  const [profileUsernameAlertMessage, setProfileUsernameAlertMessage] =
    useState({
      show: false,
    });

  //:========================================
  // Function Declaration
  //:========================================
  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        getUserProfileAPI()
          .then((profile) => {
            if (!profile) {
              logout();
              router.replace(ROUTES.login);
            }
            dispatch(
              setAuthProps_ACTION({ key: "user.profile", data: profile })
            );
          })
          .catch((error) => {
            console.error("Error in getUserProfileAPI:", error);
          });

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

  const handleLogout = (e) => {
    e.preventDefault(); // Prevents the default navigation
    logout();
    router.replace(ROUTES.login);
  };

  // Helper function to check active route
  const isSideMenuActive = useCallback(
    (path, type = "") => {
      if (currentRoutePath === path) {
        return type === "menu"
          ? "side-menu-active"
          : "side-menu-divider-active";
      }
      return "";
    },
    [currentRoutePath]
  );

  const handleClose = useCallback(() => {
    setShowOffCanvas(false);
  }, [showOffCanvas]);
  const handleShow = useCallback(() => {
    setShowOffCanvas(true);
  }, [showOffCanvas]);

  const handleSetUsernameModalOpen = useCallback(
    () => setSetUsernameModal(true),
    []
  );
  const handleSetUsernameModalClose = useCallback(
    () => setSetUsernameModal(false),
    []
  );

  const handleSubmitSetUsername = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const sanitizedValues = sanitizeFields(values);

      updateUsernameAPI(sanitizedValues)
        .then(({ message, data }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();

          const { username, ...loginJWT } = data;

          // Success
          setProfileUsernameAlertMessage({
            show: true,
            type: "success",
            message: message || "Username updated successfully!",
            showDismissible: false,
            showHeading: false,
          });

          if (username) {
            setAuthProps_ACTION({
              key: "user.profile",
              data: { username },
              type: "update_profile_username",
            });

            setTimeout(() => {
              login(loginJWT);
              router.push(
                ROUTES.userChangeProfile.replace(":username", username)
              );
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Error in setUserProfileUsernameAPI:", error);
          const { message, data, code } = error?.response?.data || {};

          const error_code = code || "";
          let error_data = data || "";
          let error_message = message || "";
          let errors = [];

          if (message) {
            if (error_code == "VALIDATION_ERRORS") {
              errors = error_data || [];
            }

            setProfileUsernameAlertMessage({
              show: true,
              type: "error",
              message: error_message,
              errors,
              showDismissible: false,
              showHeading: false,
            });
          }
          window.scrollTo(0, 0);
        })
        .finally(() => {
          setTimeout(() => {
            setProfileUsernameAlertMessage({
              show: false,
            });
          }, 15000);
          window.scrollTo(0, 0);
          setSubmitting(false);
        });
    },
    []
  );

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  // Show Set Username Modal When Username Blank
  useEffect(() => {
    if (profile_DATA?.username === "") {
      setProfileUsernameAlertMessage({
        show: true,
        type: "warning",
        message: "You must set first username.",
        showDismissible: false,
        showHeading: false,
      });
      handleSetUsernameModalOpen();
    } else {
      handleSetUsernameModalClose();
    }
  }, [profile_DATA]);

  return (
    <>
      <Navbar expand="false" fixed="top" className="fixedAuthHeader">
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
              <NotificationBell
                totalUnreadNotificationCount={
                  profile_DATA?.totalUnreadNotificationCount || 0
                }
              />
            </Col>
            <Col className="d-flex align-items-center justify-content-end right-menu">
              {isPostRoute ? (
                <Link
                  href={ROUTES.userDashboard}
                  className="btn btn-primary me-2"
                >
                  My Account
                </Link>
              ) : (
                <Link
                  href={CREATE_POST_STEPS_USER_PANEL[0]?.route || ""}
                  className="btn btn-primary me-2"
                >
                  Create Post
                </Link>
              )}

              <Link href={ROUTES.userPostList} className="btn btn-primary me-2">
                All Post
              </Link>
            </Col>
          </Row>
          {showOffCanvas && (
            <Navbar.Offcanvas
              placement="start"
              className="fixedAuthHeaderOffcanvas"
              show={showOffCanvas}
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
                <div className="profile">
                  <div className="profile-img">
                    <NextImage
                      src={profile_DATA?.fullPath || ""}
                      alt={profile_DATA?.username || "user-profile-image"}
                      width={70}
                      height={70}
                      quality={75}
                    />
                  </div>
                  <div className="caption">
                    <p>{profile_DATA?.username || ""}</p>
                  </div>
                </div>

                <Nav className="flex-column side-menus">
                  <h4 className="dashboard-menu">
                    <Link
                      href={ROUTES.userDashboard}
                      className={`offcanvas-link dash_board ${isSideMenuActive(
                        ROUTES.userDashboard,
                        "menu"
                      )}`}
                    >
                      <FontAwesomeIcon icon={faTachometer} /> &nbsp;
                      <strong>Dashboard</strong>
                    </Link>
                  </h4>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userDashboard
                    )}`}
                  ></div>

                  <Link
                    href={CREATE_POST_STEPS_USER_PANEL[0]?.route || ""}
                    className={`offcanvas-link ${isSideMenuActive(
                      postActionDetail?.route,
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faNewspaper} /> &nbsp; Post
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      postActionDetail?.route
                    )}`}
                  ></div>
                  <Link
                    href={ROUTES.userPostList}
                    className={`offcanvas-link ${isSideMenuActive(
                      ROUTES.userPostList,
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faNewspaper} /> &nbsp; All Post
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userPostList
                    )}`}
                  ></div>
                  <Link
                    href={ROUTES.userRechargeBalance}
                    className={`offcanvas-link ${isSideMenuActive(
                      ROUTES.userRechargeBalance,
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} /> &nbsp; Recharge
                    Balance
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userRechargeBalance
                    )}`}
                  ></div>
                  <Link
                    href={ROUTES.userRechargeBalanceHistories}
                    className={`offcanvas-link ${isSideMenuActive(
                      ROUTES.userRechargeBalanceHistories,
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} /> &nbsp; Recharge
                    Histories
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userRechargeBalanceHistories
                    )}`}
                  ></div>
                  <Link
                    href={ROUTES.userChangeProfile.replace(
                      ":username",
                      profile_DATA?.username || "no-username"
                    )}
                    className={`offcanvas-link ${isSideMenuActive(
                      ROUTES.userChangeProfile.replace(
                        ":username",
                        profile_DATA?.username || "no-username"
                      ),
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faUser} /> &nbsp; Change Profile
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userChangeProfile.replace(
                        ":username",
                        profile_DATA?.username || "no-username"
                      )
                    )}`}
                  ></div>
                  <Link
                    href={ROUTES.userViewProfile}
                    className={`offcanvas-link ${isSideMenuActive(
                      ROUTES.userViewProfile,
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faCogs} /> &nbsp; View Profile
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userViewProfile
                    )}`}
                  ></div>

                  <Link
                    href={ROUTES.userDeleteAccount}
                    className={`offcanvas-link ${isSideMenuActive(
                      ROUTES.userDeleteAccount,
                      "menu"
                    )}`}
                  >
                    <FontAwesomeIcon icon={faDeleteLeft} /> &nbsp; Delete
                    Account
                  </Link>
                  <div
                    className={`divider ${isSideMenuActive(
                      ROUTES.userDeleteAccount
                    )}`}
                  ></div>

                  <a
                    href={
                      profile_DATA?.supportEmail
                        ? `mailto:${profile_DATA?.supportEmail}`
                        : ""
                    }
                    className="offcanvas-link"
                  >
                    <FontAwesomeIcon icon={faComment} /> &nbsp; Live Support
                  </a>
                  <div className="divider"></div>
                  <Link
                    href="/"
                    onClick={handleLogout}
                    className="offcanvas-link"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> &nbsp; Logout
                  </Link>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          )}

          {/* Set Username When Blank */}
          <Modal
            show={showSetUsernameModal}
            size="sm"
            onHide={handleSetUsernameModalClose}
            backdrop="static"
            keyboard={false}
            className="set-username-modal"
          >
            <Modal.Header>
              <Modal.Title>Set Username</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <AlertMessage {...profileUsernameAlertMessage} />
              <Formik
                initialValues={profileUsernameFormInitialValues}
                validationSchema={updateUsernameFormSchema}
                onSubmit={handleSubmitSetUsername} // Formik submission handler
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  errors,
                  touched,
                  isSubmitting,
                }) => (
                  <>
                    <Form method="post" onSubmit={handleSubmit}>
                      <Form.Group className="form-group">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Username"
                          name="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        {/* Display error message for username */}
                        {errors.username && touched.username && (
                          <div className="text-danger">{errors.username}</div>
                        )}
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {/* Conditionally render spinner */}
                          {isSubmitting ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Updating...
                            </>
                          ) : (
                            "Update"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </>
                )}
              </Formik>
            </Modal.Body>
          </Modal>
        </Container>
      </Navbar>
    </>
  );
};

FixedAuthHeader.propTypes = {};

export default memo(FixedAuthHeader);
