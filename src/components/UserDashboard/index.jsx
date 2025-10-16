import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  memo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill, faNewspaper } from "@fortawesome/free-solid-svg-icons";
import {
  getUserDashboardAPI,
} from "@/api/apiAuthService.js";
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    dashboard_DATA: auth?.user?.dashboard || {},
  })
);

// Dynamic Components
const FixedAuthHeader = dynamic(() => import("@/components/FixedAuthHeader"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});

const UserDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { CODE, MESSAGE } = router.query;

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { dashboard_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });

  //:========================================
  // Function Declaration
  //:========================================
  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      try {
        getUserDashboardAPI()
          .then((dashboard) =>
            dispatch(
              setAuthProps_ACTION({ key: "user.dashboard", data: dashboard })
            )
          )
          .catch((error) => {
            console.error("Error in getUserDashboardAPI:", error);
          });
        sessionStorage.removeItem("postForm");
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

  // Handle query parameter changes
  useEffect(() => {
    if (CODE && MESSAGE && CODE === "LOGIN_SUCCESS") {
      setAlertMessage({
        show: true,
        type: "success",
        showDismissible: false,
        showHeading: true,
        message: MESSAGE,
      });

      setTimeout(() => {
        setAlertMessage({
          show: false,
        });
      }, 15000);

      // Clear query params without reloading
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [CODE, MESSAGE, router]);

  return (
    <>
      <FixedAuthHeader />
      <div className="userDashboard">
        <Container className="h-100 usrcnt">
          <AlertMessage {...alertMessage} />

          {/* Panel Heading */}
          <div className="panel_heading">
            <h3>Welcome to Dashboard.</h3>
          </div>

          {/* Panel Body */}
          <div className="panel_body">
            <Row>
              {/* Dashboard Item 1: Your Balance */}
              <Col md={4} sm={6} xs={12}>
                <Card className="dashboard_item">
                  <Card.Body className="d-flex align-items-center">
                    <div className="dashboard_icon me-3">
                      <FontAwesomeIcon icon={faMoneyBill} size="2x" />
                    </div>
                    <div className="dashboard_content">
                      <Card.Title>Your Balance</Card.Title>
                      <Card.Text>
                        {dashboard_DATA?.total_balance || 0}
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Dashboard Item 2: Total Pending Post */}
              <Col md={4} sm={6} xs={12}>
                <Card className="dashboard_item dashboard_item_2">
                  <Card.Body className="d-flex align-items-center">
                    <div className="dashboard_icon me-3">
                      <FontAwesomeIcon icon={faNewspaper} size="2x" />
                    </div>
                    <div className="dashboard_content">
                      <Card.Title>Total Pending Post</Card.Title>
                      <Card.Text>
                        {dashboard_DATA?.total_pending_post || 0}
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Dashboard Item 3: Total Active Post */}
              <Col md={4} sm={6} xs={12}>
                <Card className="dashboard_item dashboard_item_2">
                  <Card.Body className="d-flex align-items-center">
                    <div className="dashboard_icon me-3">
                      <FontAwesomeIcon icon={faNewspaper} size="2x" />
                    </div>
                    <div className="dashboard_content">
                      <Card.Title>Total Active Post</Card.Title>
                      <Card.Text>
                        {dashboard_DATA?.total_active_post || 0}
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Panel Footer */}
          <div className="panel_footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

UserDashboard.propTypes = {};

export default memo(UserDashboard);
