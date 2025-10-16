import { deleteUserAccountAPI } from "@/api/apiAuthService.js";
import FixedAuthHeader from "@/components/FixedAuthHeader";
import { logout } from "@/utils/auth.js";
import { ROUTES } from "@/utils/constant.js";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useState } from "react";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";

// Dynamic Components
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const UserDeleteAccount = () => {
  const router = useRouter();

  //:========================================
  // States Declaration
  //:========================================
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const [isLoading, setIsLoading] = useState({
    deactivateAccount: false,
    deleteAccount: false,
  });

  //:========================================
  // Function Declaration
  //:========================================
  const handleDeleteAccount = useCallback(
    (action) => {
      setIsLoading({
        ...isLoading,
        [action]: true,
      });
      deleteUserAccountAPI({ action })
        .then(({ message, data, code }) => {
          setAlertMessage({
            show: true,
            type: "success",
            message,
            showDismissible: false,
            showHeading: false,
            data,
            code,
          });
        })
        .catch((error) => {
          console.error("Error in deleteUserAccountAPI:", error);
          const { message, data, code } = error?.response?.data || {};

          const error_code = code || "";
          let error_data = data || "";
          let error_message = message || "";
          let errors = [];

          if (message) {
            if (error_code == "VALIDATION_ERRORS") {
              errors = error_data || [];
            }

            setAlertMessage({
              show: true,
              type: "error",
              message: error_message,
              errors,
              showDismissible: false,
              showHeading: false,
            });
          }
        })
        .finally(() => {
          setTimeout(() => {
            setAlertMessage({
              show: false,
            });
            logout();
            router.replace(ROUTES.login);
          }, 2000);
          setIsLoading({
            ...isLoading,
            [action]: false,
          });
          window.scrollTo(0, 0);
        });
    },
    [isLoading]
  );

  return (
    <>
      <FixedAuthHeader />
      <div className="userDeleteAccount">
        <Container className="cnt">
          <AlertMessage {...alertMessage} />

          <div className="panel-heading">
            <h3>Deactive / Delete Account</h3>
          </div>
          <div className="panel-body">
            <Row>
              <Col lg={6} md={6} sm={12} xs={12}>
                <div className="notice-msg">
                  <p>
                    Deleting your account will permanently remove all your data,
                    including posts and balance, from LocalXList.org. This
                    action is irreversible.
                  </p>
                  <Button
                    variant="danger"
                    disabled={isLoading?.deleteAccount}
                    onClick={() => {
                      if (isLoading?.deleteAccount) return;
                      if (
                        window.confirm(
                          "Are you sure you want to delete your account? This action cannot be undone."
                        )
                      ) {
                        handleDeleteAccount("deleteAccount");
                      }
                    }}
                  >
                    {/* Conditionally render spinner */}
                    {isLoading?.deleteAccount ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </div>
              </Col>
              <Col lg={6} md={6} sm={12} xs={12}>
                <div className="notice-msg">
                  <p>
                    Your account will be deactivated, but your data will remain
                    safe. To reactivate, please contact the administrator.
                  </p>
                  <Button
                    variant="primary"
                    disabled={isLoading.deactivateAccount}
                    onClick={() => {
                      if (isLoading.deactivateAccount) return;
                      if (
                        window.confirm(
                          "Are you sure you want to deactivate your account? This action cannot be undone."
                        )
                      ) {
                        handleDeleteAccount("deactivateAccount");
                      }
                    }}
                  >
                    {/* Conditionally render spinner */}
                    {isLoading.deactivateAccount ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      "Deactivate Account"
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

export default memo(UserDeleteAccount);
