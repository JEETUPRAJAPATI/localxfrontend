import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import ReactPlayer from "react-player";

import { getUserRechargeBalanceAPI } from "@/api/apiAuthService.js";
import { ROUTES } from "@/utils/constant.js";
import PropTypes from "prop-types";

import FixedAuthHeader from "@/components/FixedAuthHeader";

// Redux
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    manualMethods_DATA: auth?.user?.balances?.recharge?.manualMethods || [],
    manualPaymentVideos_DATA:
      auth?.user?.balances?.recharge?.manualPaymentVideos || [],
    accountAddress_DATA: auth?.user?.balances?.recharge?.accountAddress || {},
    profile_DATA: auth?.user?.profile || {},
  })
);

// Dynamic Components
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const ManualPaymentForm = ({ manualMethods }) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedMethod) {
      // Pass selectedMethod as state to the target route
      router.push({
        pathname: ROUTES.userRechargeBalanceManualPayment,
        query: { manualPaymentMethodId: selectedMethod },
      });
    } else {
      alert("Please select a payment method.");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="mb-2"
    >
      <Form.Group>
        <Form.Control
          as="select"
          name="manual_method_id"
          required
          value={selectedMethod || ""} // Ensure a default value is provided
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          <option disabled value="">
            -Select-
          </option>
          {manualMethods.map((item) => (
            <option key={item?.id} value={item?.id}>
              {item?.method_name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <div className="d-grid gap-2 mt-2">
        <Button type="submit" name="PAYMENT_METHOD" variant="success">
          Manual Payment
        </Button>
      </div>
    </Form>
  );
};
ManualPaymentForm.propTypes = {
  // Props
  manualMethods: PropTypes.array,
  profile: PropTypes.object,
};

const UserRechargeBalance = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { CODE, MESSAGE } = router.query;

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  const { manualMethods_DATA, manualPaymentVideos_DATA, profile_DATA } =
    useSelector(storeSelectorData);
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
        getUserRechargeBalanceAPI()
          .then((data) => {
            dispatch(
              setAuthProps_ACTION({ key: "user.balances.recharge", data: data })
            );
          })
          .catch((error) => {
            console.error("Error in getUserRechargeBalanceAPI:", error);
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
    if (CODE && MESSAGE) {
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
      }, 5000);

      // Clear query params without reloading
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [CODE, MESSAGE]);

  return (
    <>
      <FixedAuthHeader />
      <div className="userRechargeBalance">
        <Container className="cnt">
          <AlertMessage {...alertMessage} />
          <div className="panel-heading">
            <h3>Recharge Balance</h3>
          </div>
          <div className="panel-body">
            <Row>
              <Col>
                <div className="notice-msg">
                  <p>
                    Crypto payers: please use manual payment for recharge. We
                    have added BTC and Litecoin payment in the manual payment
                    option. Please use the manual payment option until we
                    complete upgrading.
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm={4} className="recharge-balance-section">
                <ManualPaymentForm
                  profile={profile_DATA}
                  manualMethods={manualMethods_DATA}
                />
              </Col>
            </Row>
            <Row
              className="mt-3 g-3"
              style={{ borderTop: " dashed 1px", padding: "10px 0" }}
            >
              {manualPaymentVideos_DATA.map((video, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3}>
                  <Card className="shadow-sm">
                    {/* Video Wrapper to ensure it fits within Card */}
                    <div
                      className="video-wrapper"
                      style={{
                        borderRadius: "8px 8px 0 0",
                        overflow: "hidden",
                      }}
                    >
                      <ReactPlayer
                        url={video.video_path}
                        width="100%"
                        height="200px"
                        controls
                      />
                    </div>

                    <Card.Body>
                      {/* Title & Button Side by Side */}
                      <div className="d-flex justify-content-between align-items-center">
                        <Card.Title
                          className="mb-0 text-truncate"
                          style={{ width: "80%" }}
                        >
                          {video.title}
                        </Card.Title>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            window.open(video.video_path, "_blank")
                          }
                          style={{ width: "20%" }}
                        >
                          Open
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

UserRechargeBalance.propTypes = {};

export default memo(UserRechargeBalance);
