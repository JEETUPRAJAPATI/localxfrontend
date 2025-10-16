"use client";

import { lazy, memo, useCallback, useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";

import { connect } from "react-redux";

import { Suspense } from "react";

import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice";

import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  pageContactAPI,
} from "@/api/apiService.js";
import {
  removeHTMLTags,
  sanitizeFields,
  sanitizeHTML,
} from "@/utils/helpers.js";
import { contactFormSchema } from "@/utils/yupValidationSchema.js";
import { ErrorMessage, Formik } from "formik";
import PropTypes from "prop-types";
import ReCAPTCHA from "react-google-recaptcha";

import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import ReactHtmlParser from "html-react-parser";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const SponserSites = lazy(() => import("@/components/SponserSites/index.jsx"));
const AlertMessage = lazy(() => import("@/components/AlertMessage/index.jsx"));

const ContactUs = (props) => {
  const { width } = useDeviceSize();

  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";

  //:========================================
  // Component Props
  //:========================================
  const { setSponsers_ACTION, setTopSideNavLinks_ACTION, pageHeading_DATA } =
    props;

  //:========================================
  // States Declaration
  //:========================================
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const contactFormInitialValues = {
    name: "",
    subject: "",
    email: "",
    phone_number: "",
    message: "",
    googleCaptcha: "",
  };
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA

  //:========================================
  // Function Declaration
  //:========================================
  const onCaptchaChange = useCallback((value, setFieldValue) => {
    if (value) {
      setFieldValue("googleCaptcha", value);
    }
  }, []);

  const handleSignUpSubmit = useCallback(
    (values, { setSubmitting, resetForm, setFieldValue }) => {
      const sanitizedValues = sanitizeFields(values);

      pageContactAPI(sanitizedValues)
        .then(({ message }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();

          setAlertMessage({
            show: true,
            type: "success",
            showDismissible: false,
            message: message,
          });
        })
        .catch((error) => {
          console.error("Error in pageContactAPI:", error);
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
      try {
        getCategoryTopSideNavLinksAPI()
          .then((topSideNavLinks) => setTopSideNavLinks_ACTION(topSideNavLinks))
          .catch((error) => {
            console.error("Error in getCategoryTopSideNavLinksAPI:", error);
          });

        getCategorySponsersAPI({ deviceWidth: width })
          .then((sponsers) => setSponsers_ACTION(sponsers))
          .catch((error) => {
            console.error("Error in getCategorySponsersAPI:", error);
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

    return () => {
      // Reset and rerender the reCAPTCHA widget
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      // Force re-render of the reCAPTCHA component
      setRecaptchaKey(1);
    };
  }, [fetchCommonAPI]);

  return (
    <>
      <FixedHeader />
      <div className="contactWrapper">
        <Container className="contact-cnt">
          <Row className="justify-content-center align-items-center">
            <Col className="contact-form">
              {ReactHtmlParser(pageHeading_DATA || "")}
              <Formik
                initialValues={contactFormInitialValues}
                validationSchema={contactFormSchema}
                onSubmit={handleSignUpSubmit} // Formik submission handler
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                  touched,
                  errors,
                  values,
                  isSubmitting,
                }) => (
                  <>
                    <Form onSubmit={handleSubmit}>
                      <AlertMessage {...alertMessage} />
                      <Row>
                        <Col sm={6}>
                          <Form.Group controlId="formName">
                            <Form.Control
                              type="text"
                              placeholder="Your Name"
                              name="name"
                              value={values.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-danger"
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group controlId="formSubject">
                            <Form.Control
                              type="text"
                              placeholder="Subject"
                              name="subject"
                              value={values.subject}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <ErrorMessage
                              name="subject"
                              component="div"
                              className="text-danger"
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group controlId="formEmail">
                            <Form.Control
                              type="email"
                              placeholder="Your E-mail"
                              name="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="text-danger"
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group controlId="formPhone">
                            <Form.Control
                              type="number"
                              placeholder="Your Phone Number"
                              name="phone_number"
                              value={values.phone_number}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <ErrorMessage
                              name="phone_number"
                              component="div"
                              className="text-danger"
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={12}>
                          <Form.Group controlId="formMessage">
                            <Form.Control
                              as="textarea"
                              rows={10}
                              placeholder="Your Message"
                              name="message"
                              value={values.message}
                              // onChange={handleChange}
                              onChange={(e) => {
                                const filteredValue = removeHTMLTags(
                                  e.target.value
                                );
                                setFieldValue("message", filteredValue);
                              }}
                              onBlur={handleBlur}
                            />
                            <ErrorMessage
                              name="message"
                              component="div"
                              className="text-danger"
                            />
                          </Form.Group>
                        </Col>
                        {/* Google reCAPTCHA component */}
                        {APP_RECAPTCHA_KEY && (
                          <div className="mt-1 mb-2">
                            <div className="d-flex">
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
                              <div className="text-danger">
                                {errors.googleCaptcha}
                              </div>
                            )}
                          </div>
                        )}
                        <Col sm={12}>
                          <Button
                            variant="primary"
                            className="btn"
                            style={{
                              background: "#405e8f",
                              borderColor: "#405e8f",
                            }}
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
                              "Send"
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </>
                )}
              </Formik>
            </Col>
          </Row>
        </Container>

        <Container fluid className="mt-4 contact-map-cnt">
          <Row>
            <Col>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26360909.888257876!2d-113.74875964478716!3d36.242299409623534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited+States!5e0!3m2!1sen!2sbd!4v1546956915795"
                style={{
                  border: 0,
                  width: "100%",
                  height: "40vh",
                  frameBorder: "0",
                  allowFullScreen: "true",
                }}
              ></iframe>
            </Col>
          </Row>
        </Container>

        <Suspense fallback={<CustomPlaceholder />}>
          <SponserSites className="mt-4" />
        </Suspense>
      </div>
      <Footer className="mt-4" />
    </>
  );
};

ContactUs.propTypes = {
  pageHeading_DATA: PropTypes.string,

  // Functions
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (state) => ({
  pageHeading_DATA: sanitizeHTML(state?.headSeo?.pageHeading || ""),
});

const mapDispatchToProps = {
  setSponsers_ACTION: setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(ContactUs));
