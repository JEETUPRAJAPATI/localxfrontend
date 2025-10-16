import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import ReactHtmlParser from "html-react-parser";

import { authResetPasswordWithVerificationAPI } from "@/api/apiService.js";
import { sanitizeFields, sanitizeHTML } from "@/utils/helpers.js";
import { ErrorMessage, Formik } from "formik";

import { resetPasswordVerificationFormSchema } from "@/utils/yupValidationSchema.js";

import { ROUTES } from "@/utils/constant.js";
import { KeyIcon, LockIcon } from "@/utils/customFontIcons";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.headSeo,
  (headSeo) => ({
    logo_DATA: headSeo?.image || "/images/logo.png",
    pageHeading_DATA: sanitizeHTML(headSeo?.pageHeading || ""),
  })
);

// Dynamic Components
const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});

const ResetPasswordVerification = () => {
  const router = useRouter();
  const { MESSAGE, CODE } = router.query;

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { logo_DATA, pageHeading_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const resetPasswordVerficationFormInitialValues = {
    reset_password_code: "",
    new_password: "",
    confirm_new_password: "",
  };

  //:========================================
  // Function Declaration
  //:========================================
  const handleResetPasswordVerificationSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const sanitizedValues = sanitizeFields(values);

      authResetPasswordWithVerificationAPI(sanitizedValues)
        .then(({ message, data, code }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();
          if (code === "RESET_PASSWORD_SUCCESS") {
            router.push({
              pathname: ROUTES.login,
              query: { MESSAGE: message, CODE: code, DATA: data }, // Passing current path as state
            });
            return false;
          }
          setAlertMessage({
            show: true,
            type: "success",
            showDismissible: false,
            message: message,
          });
        })
        .catch((error) => {
          console.error(
            "Error in authForgotVerificationSendVerificationCodeAPI:",
            error
          );
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
          }, 15000);
          setSubmitting(false);
        });
    },
    []
  );
  // Handle query parameter changes
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
      }, 15000);

      // Clear query params without reloading
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [CODE, MESSAGE, router]);

  return (
    <>
      <div className="reset-password-code-verification-wrapper">
        <Container className="rst-pwd-vrfcn-code-cnt">
          <Row>
            <Col className=" d-flex justify-content-center align-items-center">
              <Link href={ROUTES.home} className="brand-logo">
                <NextImage
                  src={logo_DATA}
                  alt="Logo"
                  width={180} // Adjusted for scale
                  height={50} // Adjusted for scale
                  priority
                  quality={75}
                />
              </Link>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center align-items-center">
              {ReactHtmlParser(pageHeading_DATA || "")}
            </Col>
          </Row>

          <Row>
            <Col>
              <AlertMessage {...alertMessage} />
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center align-items-center text-center">
              <p>
                Check Your Email or Spam Folder To Get Your Reset Password Code
              </p>
            </Col>
            <Formik
              initialValues={resetPasswordVerficationFormInitialValues}
              validationSchema={resetPasswordVerificationFormSchema}
              onSubmit={handleResetPasswordVerificationSubmit} // Formik submission handler
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                // errors,
                // touched,
                isSubmitting,
                // setFieldValue,
              }) => (
                <>
                  <Form
                    className="forgotVerificationForm mb-3"
                    onSubmit={handleSubmit}
                  >
                    <Form.Group
                      className="mb-2"
                      controlId="reset_password_code"
                    >
                      <InputGroup>
                        <InputGroup.Text>
                          <KeyIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: " 25px",
                            }}
                          />
                        </InputGroup.Text>

                        <Form.Control
                          type="text"
                          placeholder="Reset Password Code"
                          name="reset_password_code"
                          value={values.reset_password_code}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="reset_password_code"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-2" controlId="new_password">
                      <InputGroup>
                        <InputGroup.Text>
                          <LockIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: " 25px",
                            }}
                          />
                        </InputGroup.Text>

                        <Form.Control
                          type="text"
                          placeholder="New Password"
                          name="new_password"
                          value={values.new_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="new_password"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-2"
                      controlId="confirm_new_password"
                    >
                      <InputGroup>
                        <InputGroup.Text>
                          <LockIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: " 25px",
                            }}
                          />
                        </InputGroup.Text>

                        <Form.Control
                          type="text"
                          placeholder="Confirm New Password"
                          name="confirm_new_password"
                          value={values.confirm_new_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="confirm_new_password"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <div className="d-grid mt-2">
                      <Button
                        variant="primary"
                        className="sign__in__btn"
                        type="submit" // Link the button to the form with the id "postReportForm"
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
                            Submitting...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </Form>
                </>
              )}
            </Formik>
          </Row>
        </Container>
      </div>
    </>
  );
};

ResetPasswordVerification.propTypes = {};

export default memo(ResetPasswordVerification);
