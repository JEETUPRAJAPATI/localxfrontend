import { GoogleLogin } from "@react-oauth/google";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
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
import ReCAPTCHA from "react-google-recaptcha";

import { LockIcon } from "@/utils/customFontIcons";
import { faEnvelope as faEnvelopeRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { sanitizeFields, sanitizeHTML } from "@/utils/helpers.js";
import { loginFormSchema } from "@/utils/yupValidationSchema.js";
import ReactHtmlParser from "html-react-parser";

import {
  authGoogleLoginAPI,
  authLoginAPI,
  getAuthLoginAlertMessageAPI,
} from "@/api/apiService.js";
import { ErrorMessage, Formik } from "formik";

import { login } from "@/utils/auth.js";
import { ROUTES } from "@/utils/constant.js";

// Redux
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (state) => state.headSeo,
  (auth, headSeo) => ({
    loginAlertMessage_DATA: sanitizeHTML(auth?.login?.alertMessage || ""),
    logo_DATA: headSeo?.image || "/images/logo.png",
    pageHeading_DATA: sanitizeHTML(headSeo?.pageHeading || ""),
  })
);

// Dynamic Components
const CustomPlaceholder = dynamic(
  () => import("@/components/CustomPlaceholder/index.jsx"),
  {
    ssr: false,
  }
);
const NextImage = dynamic(() => import("@/components/NextImage/index.jsx"), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const LazyContent = dynamic(
  () => import("@/components/CustomLazyLoadContent"),
  {
    ssr: false,
  }
);

const Login = () => {
  const dispatch = useDispatch();

  const router = useRouter();
  const { MESSAGE, CODE } = router.query;

  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { loginAlertMessage_DATA, logo_DATA, pageHeading_DATA } =
    useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const loginFormInitialValues = {
    email: "",
    password: "",
    googleCaptcha: "",
  };
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA
  const [googleLoginProcessing, setGoogleLoginProcessing] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================
  const onCaptchaChange = useCallback((value, setFieldValue) => {
    if (value) {
      setFieldValue("googleCaptcha", value);
    }
  }, []);

  const handleLoginSubmit = useCallback(
    (values, { setSubmitting, resetForm, setFieldValue }) => {
      const sanitizedValues = sanitizeFields(values);

      authLoginAPI(sanitizedValues)
        .then(({ message, data, code }) => {
          resetForm();
          // Set Auth Token
          dispatch(setAuthProps_ACTION({ key: "data", data }));
          login(data);

          router.push({
            pathname: ROUTES.userDashboard,
            query: { MESSAGE: message, CODE: code, DATA: data },
          });
        })
        .catch((error) => {
          console.error("Error in authLoginAPI:", error);
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

  const fetchCommonAPI = useCallback(() => {
    const fetchAPI = async () => {
      setIsLoading(true);
      try {
        getAuthLoginAlertMessageAPI()
          .then((alertMessage) =>
            dispatch(
              setAuthProps_ACTION({
                key: "login.alertMessage",
                data: alertMessage,
              })
            )
          )
          .catch((error) => {
            console.error("Error in getAuthLoginAlertMessageAPI:", error);
          })
          .finally(() => setIsLoading(false));
      } catch (error) {
        console.error("Failed to fetch common API:", error);
      }
    };
    fetchAPI();
  }, []);

  const handleGoogleLoginSuccess = useCallback((credentialResponse) => {
    const { credential } = credentialResponse;
    setGoogleLoginProcessing(true);
    authGoogleLoginAPI({ idToken: credential })
      .then(({ message, data, code }) => {
        // Set Auth Token
        dispatch(setAuthProps_ACTION({ key: "data", data }));
        login(data);

        router.push({
          pathname: ROUTES.userDashboard,
          query: { LOGIN: { code, message } },
        });
      })
      .catch((error) => {
        console.error("Error in authGoogleLoginAPI:", error);
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
        setGoogleLoginProcessing(false);
        setTimeout(() => {
          setAlertMessage({
            show: false,
          });
        }, 15000);
      });
  }, []);

  const handleGoogleLoginFailure = useCallback((response) => {
    console.error("Login failed: ", response);
  }, []);

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

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

    return () => {
      // Reset and rerender the reCAPTCHA widget
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      // Force re-render of the reCAPTCHA component
      setRecaptchaKey(1);
    };
  }, [CODE, MESSAGE, router]);

  return (
    <>
      <div className="login-wrapper">
        <Container className="login-cnt">
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
              <div className="desc">
                {isLoading && !loginAlertMessage_DATA ? (
                  <>
                    <CustomPlaceholder />
                  </>
                ) : (
                  <LazyContent
                    height={"10px"}
                    content={ReactHtmlParser(loginAlertMessage_DATA)}
                  />
                )}
              </div>
            </Col>
            <Formik
              initialValues={loginFormInitialValues}
              validationSchema={loginFormSchema}
              onSubmit={handleLoginSubmit} // Formik submission handler
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
                  <Form className="loginForm" onSubmit={handleSubmit}>
                    <Form.Group className="mb-2" controlId="email">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon
                            style={{
                              color: "#adadad",
                              height: "25px",
                              width: " 25px",
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
                              width: " 25px",
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
                          "Login"
                        )}
                      </Button>
                    </div>
                  </Form>
                </>
              )}
            </Formik>
          </Row>

          {/* Additional texts below the login button */}
          <Row className=" mt-3 text-center">
            <Col>
              <p>
                Forgot Password?{" "}
                <Link href={ROUTES.forgotPassword}>Reset here</Link>
              </p>
              <p>
                New here? <Link href={ROUTES.signup}>Signup Now</Link>
              </p>
              <p>
                Forgot Verification Code?{" "}
                <Link href={ROUTES.forgotVerification}>Resend here</Link>
              </p>
              <p>OR</p>

              <div className="mb-1 d-flex justify-content-center mt-2 login-with-google-section">
                {googleLoginProcessing ? (
                  <div>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginFailure}
                    size="large"
                    theme="filled_blue"
                    disabled={googleLoginProcessing}
                  />
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

Login.propTypes = {};

export default memo(Login);
