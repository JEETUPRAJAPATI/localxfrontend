import {
  authSignUpSendVerificationCode,
  authSignUpVerifyVerificationCode,
} from "@/api/apiService.js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import ReactHtmlParser from "html-react-parser";

import { ErrorMessage, Formik } from "formik";

import { ROUTES } from "@/utils/constant.js";
import { sanitizeFields, sanitizeHTML } from "@/utils/helpers.js";
import { signupVerificationCodeFormSchema } from "@/utils/yupValidationSchema.js";

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

const SignupVerification = () => {
  const router = useRouter();
  const { MESSAGE, CODE, DATA } = router.query;

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
  const signupVerificationFormInitialValues = {
    confirmation_code: "",
  };

  //:========================================
  // Function Declaration
  //:========================================
  const handleSignUpVerificationCodeSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const sanitizedValues = sanitizeFields({ ...values, ...DATA });

      authSignUpVerifyVerificationCode(sanitizedValues)
        .then(({ message, code }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();
          if (code === "SIGNUP_VERIFICATION_SUCCESS") {
            router.push({
              pathname: ROUTES.login,
              query: { MESSAGE: message, CODE: code }, // Passing current path as state
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
          console.error("Error in authSignUpVerifyVerificationCode:", error);
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

  const handleSignUpSendVerificationCode = useCallback((e) => {
    e.preventDefault();

    const sanitizedValues = sanitizeFields(DATA);

    authSignUpSendVerificationCode(sanitizedValues)
      .then(({ message }) => {
        setAlertMessage({
          show: true,
          type: "success",
          showDismissible: false,
          message: message,
        });
      })
      .catch((error) => {
        console.error("Error in authSignUpSendVerificationCode:", error);
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
      });
  }, []);

  useEffect(() => {
    if (CODE) {
      switch (CODE) {
        case "USER_NOT_VERIFIED":
          setAlertMessage({
            show: true,
            type: "warning",
            showDismissible: false,
            showHeading: true,
            message: (
              <span>
                You have not verified your account. Please enter the
                verification code sent to your email or click{" "}
                <Link to="." onClick={handleSignUpSendVerificationCode}>
                  here
                </Link>{" "}
                to resend the email.
              </span>
            ),
          });
          break;

        default:
          setAlertMessage({
            show: true,
            type: "success",
            showDismissible: false,
            showHeading: true,
            message: MESSAGE,
          });
          // Replace the current history entry to clear the `fromLogin` state
          router.push(".");
          break;
      }

      setTimeout(() => {
        setAlertMessage({
          show: false,
        });
      }, 15000);
    }
  }, [CODE]);

  return (
    <div className="signup-verification-wrapper">
      <Container className="sgnp-vrfc-cnt">
        <Row>
          <Col className="d-flex justify-content-center align-items-center">
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
            <p>Check Your Email or Spam Folder To Get Your Verification Code</p>
          </Col>
          <Formik
            initialValues={signupVerificationFormInitialValues}
            validationSchema={signupVerificationCodeFormSchema}
            onSubmit={handleSignUpVerificationCodeSubmit} // Formik submission handler
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
                  className="forgotVerificationForm mt-2"
                  onSubmit={handleSubmit}
                >
                  <Form.Group className="mb-2" controlId="confirmation_code">
                    <Form.Control
                      type="text"
                      placeholder="Enter Your Verification Code"
                      name="confirmation_code"
                      value={values.confirmation_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage
                      name="confirmation_code"
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
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Formik>
        </Row>
        <Row className="text-center mt-3">
          <Col>
            <p>
              Already Have An Account?{" "}
              <Link href={ROUTES.login}>Login Here</Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

SignupVerification.propTypes = {};

export default memo(SignupVerification);
