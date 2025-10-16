import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";

import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { authForgotPasswordSendVerificationCodeAPI } from "@/api/apiService.js";
import { sanitizeFields, sanitizeHTML } from "@/utils/helpers.js";
import { ErrorMessage, Formik } from "formik";
import ReactHtmlParser from "html-react-parser";

import { ROUTES } from "@/utils/constant.js";
import { forgotPasswordFormSchema } from "@/utils/yupValidationSchema.js";

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

const ForgotPassword = () => {
  const router = useRouter();

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
  const forgotPasswordFormInitialValues = {
    username: "",
  };

  //:========================================
  // Function Declaration
  //:========================================
  const handleForgotPasswordSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const sanitizedValues = sanitizeFields(values);

      authForgotPasswordSendVerificationCodeAPI(sanitizedValues)
        .then(({ message, data, code }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();
          if (code === "VERIFICATION_CODE_SENT_SUCCESS") {
            router.push({
              pathname: ROUTES.resetPassword,
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
            "Error in authForgotPasswordSendVerificationCodeAPI:",
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

  return (
    <>
      <div className="forgot-password-code-wrapper">
        <Container className="frgt-pwd-code-cnt">
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
            <Col>
              <Formik
                initialValues={forgotPasswordFormInitialValues}
                validationSchema={forgotPasswordFormSchema}
                onSubmit={handleForgotPasswordSubmit} // Formik submission handler
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
                      className="forgotVerificationForm"
                      onSubmit={handleSubmit}
                    >
                      <Form.Group className="mb-2" controlId="username">
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon
                              style={{
                                color: "#adadad",
                                height: "25px",
                                width: " 25px",
                              }}
                              icon={faUser}
                            />
                          </InputGroup.Text>

                          <Form.Control
                            type="text"
                            placeholder="Username / Email"
                            name="username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </InputGroup>
                        <ErrorMessage
                          name="username"
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
                            "Send Reset Password Code"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </>
                )}
              </Formik>
            </Col>
          </Row>
          {/* Additional texts below the forgotVerification button */}
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
    </>
  );
};

ForgotPassword.propTypes = {};

export default memo(ForgotPassword);
