import dynamic from "next/dynamic";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";

import { LockIcon } from "@/utils/customFontIcons";
import {
  faEnvelope as faEnvelopeRegular,
  faUser,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReCAPTCHA from "react-google-recaptcha";
import ReactHtmlParser from "html-react-parser";

import { authSignUpAPI } from "@/api/apiService.js";
import { ROUTES } from "@/utils/constant.js";
import { sanitizeFields, sanitizeHTML } from "@/utils/helpers.js";
import { signupFormSchema } from "@/utils/yupValidationSchema.js";
import { ErrorMessage, Formik } from "formik";

// Redux
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useRouter } from "next/router";

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

const Signup = () => {
  const router = useRouter();
  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";

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
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA
  const signupFormInitialValues = {
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    terms: false,
    googleCaptcha: "",
  };

  //:========================================
  // Function Declaration
  //:========================================
  const onCaptchaChange = useCallback((value, setFieldValue) => {
    setFieldValue("googleCaptcha", value);
  }, []);

  const handleSignUpSubmit = useCallback(
    (values, { setSubmitting, resetForm, setFieldValue }) => {
      const sanitizedValues = sanitizeFields(values);

      authSignUpAPI(sanitizedValues)
        .then(({ message, data, code }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();
          if (code === "SIGNUP_SUCCESS") {
            router.push({
              pathname: ROUTES.signupVerification,
              query: { MESSAGE: message, CODE: code, DATA: data },
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
          console.error("Error in authSignUpAPI:", error);
          const { message, data, code } = error?.response?.data || {};

          const error_code = code || "";
          let error_data = data || "";
          let error_message = message || "";
          let errors = [];

          if (message) {
            if (error_code == "VALIDATION_ERRORS") {
              errors = error_data || [];
            }

            if (error_code === "USER_NOT_VERIFIED") {
              // Navigate to another page
              // sign_up_verification?username=
              router.push({
                pathname: ROUTES.signupVerification,
                query: {
                  CODE: error_code,
                  DATA: data,
                },
              });
              return false;
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

          // Optional: Handle detail API error
        })
        .finally(() => {
          setTimeout(() => {
            setAlertMessage({
              show: false,
            });
          }, 15000);
          setSubmitting(false);
          // Reset and rerender the reCAPTCHA widget
          if (recaptchaRef.current) {
            setFieldValue("googleCaptcha", "");
            recaptchaRef.current.reset();
            setRecaptchaKey((prevKey) => prevKey + 1); // Re-render on expiry
          }
        });
    },
    []
  );

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    return () => {
      // Reset and rerender the reCAPTCHA widget
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      // Force re-render of the reCAPTCHA component
      setRecaptchaKey(1);
    };
  }, []);

  return (
    <>
      <div className="signup-wrapper">
        <Container className="signup-cnt">
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
            <Formik
              initialValues={signupFormInitialValues}
              validationSchema={signupFormSchema}
              onSubmit={handleSignUpSubmit} // Formik submission handler
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
                isSubmitting,
                setFieldValue,
              }) => (
                <>
                  <Form className="signupForm" onSubmit={handleSubmit}>
                    <AlertMessage {...alertMessage} />
                    <Form.Group className="mb-2" controlId="username">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: "25px",
                            }}
                            icon={faUser}
                          />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Username"
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

                    <Form.Group className="mb-2" controlId="email">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: "25px",
                            }}
                            icon={faEnvelopeRegular}
                          />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="Email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-2" controlId="password">
                      <InputGroup>
                        <InputGroup.Text>
                          <LockIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: "25px",
                            }}
                          />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-2" controlId="confirm_password">
                      <InputGroup>
                        <InputGroup.Text>
                          <LockIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: "25px",
                            }}
                          />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          name="confirm_password"
                          value={values.confirm_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="confirm_password"
                        component="div"
                        className="text-danger"
                      />
                    </Form.Group>

                    <Form.Group className="mb-2" controlId="terms_conditions">
                      <Form.Check
                        type="checkbox"
                        className="d-flex justify-content-center align-items-center"
                        label={
                          <>
                            <Link
                              href={ROUTES.terms}
                              className="terms-link ms-2"
                            >
                              Terms & Conditions
                            </Link>
                          </>
                        }
                        name="terms"
                        value={values.terms}
                        onChange={handleChange}
                      />
                      <ErrorMessage
                        name="terms"
                        component="div"
                        className="text-danger text-center"
                      />
                    </Form.Group>

                    {/* Google reCAPTCHA component */}
                    <div className="google-recaptcha-section">
                      <div className="d-flex justify-content-center">
                        <ReCAPTCHA
                          key={recaptchakey}
                          ref={recaptchaRef}
                          sitekey={APP_RECAPTCHA_KEY} // Replace with your reCAPTCHA site key
                          onChange={(value) =>
                            onCaptchaChange(value, setFieldValue)
                          }
                          onExpired={() => {
                            console.warn("Captcha expired.");
                            if (recaptchaRef.current) {
                              recaptchaRef.current.reset();
                            }
                            setFieldValue("googleCaptcha", "");
                            setRecaptchaKey((prevKey) => prevKey + 1); // Re-render on expiry
                          }}
                          onErrored={() => {
                            console.error("Captcha error.");
                            if (recaptchaRef.current) {
                              recaptchaRef.current.reset();
                            }
                            setFieldValue("googleCaptcha", "");
                            setRecaptchaKey((prevKey) => prevKey + 1); // Re-render on error
                          }}
                        />
                      </div>
                      {/* Display error message for googleCaptcha */}
                      {errors.googleCaptcha && touched.googleCaptcha && (
                        <div className="text-danger text-center">
                          {errors.googleCaptcha}
                        </div>
                      )}
                    </div>

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
                          "Signup"
                        )}
                      </Button>
                    </div>
                  </Form>
                </>
              )}
            </Formik>

            {/* Additional texts below the signup button */}
            <Row className="text-center mt-3">
              <Col>
                <p>
                  Already Have An Account?{" "}
                  <Link href={ROUTES.login}>Login Here</Link>
                </p>
              </Col>
            </Row>
          </Row>
        </Container>
      </div>
    </>
  );
};

Signup.propTypes = {};

export default memo(Signup);
