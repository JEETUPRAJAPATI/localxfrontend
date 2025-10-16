import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { Editor } from "@tinymce/tinymce-react";
import ReCAPTCHA from "react-google-recaptcha";

import { setSponsers_ACTION } from "@/store/sponsersSlice.js";
import { setTopSideNavLinks } from "@/store/topSideNavLinksSlice.js";

import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
import {
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  partnersAddAPI,
} from "@/api/apiService.js";
import { useRouter } from "next/router";
import Link from "next/link";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Formik, ErrorMessage } from "formik";
import { partnerFormSchema } from "@/utils/yupValidationSchema.js";
import { sanitizeFields } from "@/utils/helpers.js";
import { ROUTES } from "@/utils/constant.js";
import useDeviceSize from "@/customHooks/useDeviceSize.js";

const FixedHeader = lazy(() => import("@/components/FixedHeader/index.jsx"));
const Footer = lazy(() => import("@/components/Footer/index.jsx"));
const SponserSites = lazy(() => import("@/components/SponserSites/index.jsx"));
const AlertMessage = lazy(() => import("@/components/AlertMessage/index.jsx"));

const PartnerAdd = (props) => {
  const router = useRouter();

  const bannerCode = `
<a href="https://localxlist.org/" target="_blank">
  <img src="https://localxlist.org/photo/new-banner1.gif" 
  class="img-responsive" alt="Localxlist Escorts" 
  title="The Best Local Escorts">
</a>`;

  const { width } = useDeviceSize();

  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";

  //:========================================
  // Component Props
  //:========================================
  const { setSponsers_ACTION, setTopSideNavLinks_ACTION } = props;

  //:================================================================
  // Data Updation or Manipulation Declaration (Computation Logic)
  //:================================================================

  //:========================================
  // States Declaration
  //:========================================
  // const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const partnerFormInitialValues = {
    name: "",
    email: "",
    url: "",
    html_url: "",
    description: "",
    answer: "",
    googleCaptcha: "",
  };

  //:========================================
  // Function Declaration
  //:========================================

  const onCaptchaChange = useCallback((value, setFieldValue) => {
    setFieldValue("googleCaptcha", value);
  }, []);

  const handlePartnerSubmit = useCallback(
    (values, { setSubmitting, resetForm, setFieldValue }) => {
      const sanitizedValues = sanitizeFields(values);

      partnersAddAPI(sanitizedValues)
        .then(({ message, data, code }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();

          router.push({
            pathname: ROUTES.partners,
            query: { MESSAGE: message, CODE: code, DATA: data },
          });
        })
        .catch((error) => {
          console.error("Error in partnersAddAPI:", error);
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
          window.scrollTo(0, 0);
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
        // setIsLoading(true);

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

  const handleCopy = () => {
    navigator.clipboard
      .writeText(bannerCode.trim())
      .then(() => setCopySuccess(true))
      .catch(() => setCopySuccess(false));

    // Reset success message after 2 seconds
    setTimeout(() => setCopySuccess(false), 2000);
  };

  //:========================================
  // Effect Load Declaration
  //:========================================
  useEffect(() => {
    fetchCommonAPI();
  }, [fetchCommonAPI]);

  return (
    <>
      <Suspense fallback={<CustomPlaceholder />}>
        <FixedHeader />
      </Suspense>
      <div className="partnerAdd">
        <Container className="partnerAdd-cnt">
          <Row>
            <Col>
              <Breadcrumb className="breadcrumb-area">
                <Breadcrumb.Item linkAs={Link} href={ROUTES.home}>
                  Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} href={"/partners"}>
                  Partners
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Add</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>

          <Row>
            <Col>
              <Formik
                initialValues={partnerFormInitialValues}
                validationSchema={partnerFormSchema}
                onSubmit={handlePartnerSubmit} // Formik submission handler
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
                  setFieldTouched,
                }) => (
                  <>
                    <Form className="partnerAddForm" onSubmit={handleSubmit}>
                      <h2 className="mt-4">Submit Your Site</h2>
                      <AlertMessage {...alertMessage} />

                      {/* Name */}
                      <Form.Group className="form-group" controlId="name">
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your name"
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

                      {/* Email */}
                      <Form.Group className="form-group" controlId="email">
                        <Form.Label>Your Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
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

                      {/* URL */}
                      <Form.Group className="form-group" controlId="url">
                        <Form.Label>URL of the Site</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter URL of the site"
                          name="url"
                          value={values.url}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <ErrorMessage
                          name="url"
                          component="div"
                          className="text-danger"
                        />
                      </Form.Group>

                      {/* HTML URL */}
                      <Form.Group className="form-group" controlId="htmlurl">
                        <Form.Label>HTML Link</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="<a href='https://localxlist.org'>Localxlist</a>"
                          name="html_url"
                          value={values.html_url}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <ErrorMessage
                          name="html_url"
                          component="div"
                          className="text-danger"
                        />
                      </Form.Group>

                      {/* TinyMCE Editor for Description */}
                      <Form.Group
                        className="form-group"
                        controlId="description"
                      >
                        <Form.Label>Description</Form.Label>
                        <Editor
                          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""} // Your TinyMCE API Key
                          init={{
                            selector: "textarea", // This is the default selector
                            plugins: [
                              "print preview paste importcss searchreplace autolink autosave save",
                              "directionality code visualblocks visualchars fullscreen image link media",
                              "template codesample table charmap hr pagebreak nonbreaking anchor toc",
                              "insertdatetime advlist lists wordcount imagetools textpattern noneditable",
                              "help charmap quickbars emoticons",
                            ],
                            toolbar:
                              "undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | " +
                              "alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | " +
                              "forecolor backcolor removeformat | fullscreen preview | template link anchor codesample",
                            toolbar_sticky: true,
                            autosave_ask_before_unload: true,
                            autosave_interval: "30s",
                            autosave_prefix: "{path}{query}-{id}-",
                            autosave_restore_when_empty: false,
                            autosave_retention: "2m",
                            content_css: "//www.tiny.cloud/css/codepen.min.css",
                            height: 300,
                            image_caption: true,
                            quickbars_selection_toolbar:
                              "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                            noneditable_noneditable_class: "mceNonEditable",
                            toolbar_mode: "sliding",
                            branding: false,
                            imagetools_cors_hosts: ["picsum.photos"],
                          }}
                          value={values.description}
                          // Update Formik's value on change
                          onEditorChange={(content) =>
                            setFieldValue("description", content)
                          }
                          // Mark the field as touched on blur
                          onBlur={() => setFieldTouched("description", true)}
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-danger"
                        />
                      </Form.Group>

                      {/* Info Box */}
                      <div className="mb-3 info-box">
                        <p>
                          <strong>
                            Webmasters: As a courtesy, please backlink
                            Localxlist.org on your websites:
                          </strong>
                          <br />
                          Our Banner Code Is:
                          <div className="code-wrapper">
                            <code>{bannerCode.trim()}</code>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {copySuccess
                                    ? "Copied!"
                                    : "Copy to clipboard"}
                                </Tooltip>
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCopy}
                                className="icon"
                                onClick={() => handleCopy()}
                              />
                            </OverlayTrigger>
                          </div>
                          Many Thanks!
                        </p>
                      </div>

                      {/* Question */}
                      <Form.Group className="form-group" controlId="question">
                        <Form.Label>
                          Where did you place our link (
                          <a href="https://localxlist.org">localxlist.org</a>)
                          on your site?
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="answer"
                          value={values.answer}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <ErrorMessage
                          name="answer"
                          component="div"
                          className="text-danger"
                        />
                      </Form.Group>

                      {/* Google reCAPTCHA component */}
                      {APP_RECAPTCHA_KEY && (
                        <div className="mb-3">
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
                          {/* Display error message for googleCaptcha */}
                          {errors.googleCaptcha && touched.googleCaptcha && (
                            <div className="text-danger">
                              {errors.googleCaptcha}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="primary"
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
                          "Submit"
                        )}
                      </Button>
                    </Form>
                  </>
                )}
              </Formik>
            </Col>
          </Row>
        </Container>
      </div>

      <Suspense fallback={<CustomPlaceholder />}>
        <SponserSites className="mt-4" />
      </Suspense>
      <Suspense fallback={<CustomPlaceholder />}>
        <Footer className="mt-4" />
      </Suspense>
    </>
  );
};

PartnerAdd.propTypes = {
  // Props

  // Functions
  setSponsers_ACTION: PropTypes.func,
  setTopSideNavLinks_ACTION: PropTypes.func,
};

const mapStateToProps = (_state) => ({});

const mapDispatchToProps = {
  setSponsers_ACTION,
  setTopSideNavLinks_ACTION: setTopSideNavLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(PartnerAdd));
