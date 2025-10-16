import {
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
  ButtonGroup,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  removeHTMLTags,
  sanitizeFields,
  sanitizeHTML,
  slugify,
  truncatedContent,
  unslugify,
} from "@/utils/helpers";
import ReCAPTCHA from "react-google-recaptcha";

import { reportFormSchema } from "@/utils/yupValidationSchema.js";
import { Formik } from "formik";

import {
  addPostReportAPI,
  getAdsAPI,
  getCategorySponsersAPI,
  getCategoryTopSideNavLinksAPI,
  getPostDetailAPI,
} from "@/api/apiService";
import useDeviceSize from "@/customHooks/useDeviceSize.js";
import { ROUTES } from "@/utils/constant.js";

// Dynamic Components
import CustomPlaceholder from "@/components/CustomPlaceholder/index.jsx";
const LazyImage = dynamic(() => import("@/components/LazyImage/index.jsx"), {
  ssr: false,
});
const FixedHeader = dynamic(
  () => import("@/components/FixedHeader/index.jsx"),
  {
    ssr: false,
  }
);
const Footer = dynamic(() => import("@/components/Footer/index.jsx"), {
  ssr: false,
});
const SponserSites = dynamic(
  () => import("@/components/SponserSites/index.jsx"),
  {
    ssr: false,
  }
);
const AlertMessage = dynamic(
  () => import("@/components/AlertMessage/index.jsx"),
  {
    ssr: false,
  }
);
const PostView = dynamic(() => import("@/components/PostView/index.jsx"), {
  ssr: false,
});

// Redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { setPostProps as setPostProps_ACTION } from "@/store/postSlice";
import { setSponsers_ACTION } from "@/store/sponsersSlice";
import { setTopSideNavLinks as setTopSideNavLinks_ACTION } from "@/store/topSideNavLinksSlice";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.post,
  (state) => state.headSeo,
  (post, headSeo) => ({
    postAds_DATA: post?.ads || [],
    post_DATA: post?.detail || {},
    pageHeading_DATA: sanitizeHTML(headSeo?.pageHeading || ""),
  })
);

const PostDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // 1. Get URL params
  // const { country, city, subCity } = router.query;
  const {
    country,
    city,
    subCity,
    category,
    subCategory,
    id: postId,
  } = router.query;

  const { width } = useDeviceSize();

  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { postAds_DATA, post_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [showPostRelativeTime, setShowPostRelativeTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  // For Redirecting Modal When No Post Found
  const [redirectTimer, setRedirectTimer] = useState(5); // Timer starts at 5 seconds
  const [showRedirectingModal, setShowRedirectingModal] = useState(false); // Show modal
  const redirectBlockedRef = useRef(false); // Mutable reference for blocking redirect
  const timerRef = useRef(null); // Reference for the interval

  // For Report Post Modal
  const [showReportPostModal, setShowReportPostModal] = useState(false);
  const [alertReportMessage, setAlertReportMessage] = useState({
    show: false,
  });
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA

  //:========================================
  // Function Declaration
  //:========================================
  const onCaptchaChange = useCallback((value, setFieldValue) => {
    if (value) {
      setFieldValue("googleCaptcha", value);
    }
  }, []);
  // Toggle between relative time and actual date
  const toggleDate = useCallback(() => {
    setShowPostRelativeTime((prev) => !prev);
  }, []);

  const handlePostReportModal = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    setShowReportPostModal(true);
  }, []);

  // :::::::::: When No Post Found Due to Deleted Or Expired ::::::::::
  // Handle redirection
  const handleRedirect = useCallback(() => {
    router.push({
      pathname: `/p/${country}/${city}/${subCity}/categories/${category}/${subCategory}/post-list`,
    });
  }, [country, city, subCity, category, subCategory]);

  // Start countdown timer
  const startRedirectTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRedirectTimer((prevTime) => {
        if (redirectBlockedRef.current) {
          console.log("Redirection blocked.");
          clearInterval(timerRef.current); // Stop the timer if blocked
          return prevTime; // Maintain the same timer value
        }
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleRedirect(); // Redirect when time runs out
          return 0; // Ensure timer stops at 0
        }
        return prevTime - 1; // Decrement timer
      });
    }, 1000);
  }, [handleRedirect]);

  // Handle button click to stop redirection
  const handleStopRedirect = useCallback(() => {
    redirectBlockedRef.current = true; // Block redirection
    setShowRedirectingModal(false); // Close modal
  }, []);

  // Cleanup interval on component unmount
  useEffect(() => {
    if (showRedirectingModal) {
      startRedirectTimer(); // Start the timer when modal is shown
    }
    return () => {
      clearInterval(timerRef.current); // Cleanup on unmount
    };
  }, [showRedirectingModal, startRedirectTimer]);

  // :::::::::: Report Post Form Modal ::::::::::
  const reportPostInitialValues = {
    email: "",
    description: "",
    googleCaptcha: "",
  };
  const handleReportPostSubmit = (
    values,
    { setSubmitting, resetForm, setFieldValue }
  ) => {
    const sanitizedValues = sanitizeFields(values);

    const formFields = {
      post_id: post_DATA?.id || "",
      ...sanitizedValues,
    };

    addPostReportAPI(formFields)
      .then(({ message }) => {
        // Reset isSubmitting to false after the form is processed
        resetForm();
        setAlertReportMessage({
          show: true,
          type: "success",
          showDismissible: false,
          message: message,
          className: "m-2",
        });

        setTimeout(() => {
          setShowReportPostModal(false); // Close modal
        }, 5000);
      })
      .catch((error) => {
        console.error("Error in addPostReportAPI:", error);
        const { message, data, code } = error?.response?.data || {};

        const error_code = code || "";
        let error_data = data || "";
        let error_message = message || "";
        let errors = [];

        if (message) {
          if (error_code == "VALIDATION_ERRORS") {
            errors = error_data || [];
          }

          setAlertReportMessage({
            show: true,
            type: "error",
            message: error_message,
            errors,
            showDismissible: false,
            showHeading: false,
            className: "m-2",
          });
        }
      })
      .finally(() => {
        setTimeout(() => {
          setAlertReportMessage({
            show: false,
          });
        }, 5000);
        setSubmitting(false);
        // Reset and rerender the reCAPTCHA widget
        if (recaptchaRef.current) {
          setFieldValue("googleCaptcha", "");
          recaptchaRef.current.reset();
          setRecaptchaKey((prevKey) => prevKey + 1); // Re-render on expiry
        }
      });
  };

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    const fetchAPI = async () => {
      setIsLoading(true);
      try {
        const fetchPromises = [];
        fetchPromises.push(
          getPostDetailAPI(
            unslugify(country),
            unslugify(city),
            unslugify(subCity),
            unslugify(category),
            unslugify(subCategory),
            postId
          )
            .then((detail) =>
              dispatch(
                setPostProps_ACTION({
                  key: "detail",
                  data: detail,
                })
              )
            )
            .catch((error) => {
              console.error("Error in getPostDetailAPI:", error);
              setAlertMessage({
                show: true,
                type: "error",
                message: error?.response?.data?.message,
                code: error?.response?.data?.code,
                showDismissible: false,
                showHeading: false,
                className: "text-center",
              });
              // Optional: Handle detail API error

              // Show modal and start the redirect countdown
              // setIsRedirecting(true);
              setShowRedirectingModal(true); // Show modal when error occurs
              startRedirectTimer();
            })
            .finally(() => {
              setIsLoading(false);
            }),
          getAdsAPI()
            .then((ads) =>
              dispatch(
                setPostProps_ACTION({
                  key: "ads",
                  data: ads,
                })
              )
            )
            .catch((error) => {
              console.error("Error in getAdsAPI:", error);
              // Optional: Handle detail API error
            }),
          getCategoryTopSideNavLinksAPI()
            .then((topSideNavLinks) =>
              dispatch(setTopSideNavLinks_ACTION(topSideNavLinks))
            )
            .catch((error) => {
              console.error("Error in getCategoryTopSideNavLinksAPI:", error);
              // Optional: Handle detail API error
            }),
          getCategorySponsersAPI({ deviceWidth: width })
            .then((sponsers) => dispatch(setSponsers_ACTION(sponsers)))
            .catch((error) => {
              console.error("Error in getCategorySponsersAPI:", error);
              // Optional: Handle detail API error
            })
        );
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchAPI();

    return () => {
      // Reset and rerender the reCAPTCHA widget
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      // Force re-render of the reCAPTCHA component
      setRecaptchaKey(1);
    };
  }, [country, city, subCity, category, subCategory, postId]);

  return (
    <>
      <FixedHeader />
      <div className="postDetail">
        <Container className="postCnt">
          <div className="post-wrapper">
            {alertMessage?.type ? (
              <Row className="mt-3">
                <Col>
                  <AlertMessage {...alertMessage} />
                  {alertMessage?.type == "error" &&
                    alertMessage?.code == "POST_ALREADY_EXPIRED_OR_DELETED" && (
                      <>
                        <div className="mb-2">
                          Oops, the post in{" "}
                          <Breadcrumb className="breadcrumb-area d-inline-flex">
                            <Breadcrumb.Item active>
                              <Link href={ROUTES.home} passHref legacyBehavior>
                                <a>{unslugify(country)}</a>
                              </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                              <Link href={ROUTES.home} passHref legacyBehavior>
                                <a>{unslugify(city)}</a>
                              </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                              <Link
                                href={`/s/${country}/${city}/${subCity}`}
                                passHref
                                legacyBehavior
                              >
                                <a>{unslugify(subCity)}</a>
                              </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                              <Link href={ROUTES.home} passHref legacyBehavior>
                                <a>{unslugify(category)}</a>
                              </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                              <Link
                                href={`/p/${country}/${city}/${subCity}/categories/${category}/${subCategory}/post-list/`}
                                passHref
                                legacyBehavior
                              >
                                <a>{unslugify(subCategory)}</a>
                              </Link>
                            </Breadcrumb.Item>
                          </Breadcrumb>{" "}
                          has already been deleted/expired!
                        </div>
                        <p>
                          If this is your post and you`re not sure why it`s been
                          deleted, please read our{" "}
                          <Link href={ROUTES.terms}>Terms of Use</Link> before
                          contacting us!
                        </p>
                        <p>Thanks,</p>
                        <p>The Localxlist Team</p>
                        <div className="mb-2">
                          <strong>Visit: </strong>
                          <Breadcrumb className="breadcrumb-area d-inline-flex">
                            <Breadcrumb.Item>
                              <Link
                                href={`/s/${country}/${city}/${subCity}`}
                                passHref
                                legacyBehavior
                              >
                                <a>{unslugify(subCity)}</a>
                              </Link>
                            </Breadcrumb.Item>

                            <Breadcrumb.Item>
                              <Link
                                href={`/p/${country}/${city}/${subCity}/categories/${category}/${subCategory}/post-list`}
                                passHref
                                legacyBehavior
                              >
                                <a>{unslugify(subCategory)}</a>
                              </Link>
                            </Breadcrumb.Item>
                          </Breadcrumb>{" "}
                          to see related posts.
                        </div>
                        {/* Modal for redirecting */}
                        <Modal
                          show={showRedirectingModal}
                          onHide={() => setShowRedirectingModal(false)}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Redirecting...</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p>
                              You will be redirected to your last visited search
                              results in <span id="timer">{redirectTimer}</span>{" "}
                              seconds.
                            </p>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button
                              variant="secondary"
                              onClick={handleStopRedirect}
                            >
                              I do not want to be redirected
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      </>
                    )}
                </Col>
              </Row>
            ) : (
              <>
                {/* Buttons with icons centered */}
                <Row className="mt-3 text-center">
                  <Col>
                    {isLoading && postId != post_DATA?.id ? (
                      <CustomPlaceholder />
                    ) : (
                      <ButtonGroup className="direction-btn">
                        {/* Previous Post Button */}
                        {post_DATA?.prev_post_id ? (
                          <Link
                            href={`/${country}/${city}/${subCity}/${category}/${subCategory}/post-view/${slugify(
                              truncatedContent(
                                sanitizeHTML(post_DATA?.prev_post_title),
                                60
                              )
                            )}/${post_DATA?.prev_post_id}.html`}
                            passHref
                            legacyBehavior
                          >
                            <Button variant="primary" as="a">
                              ◀ Prev
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="primary" disabled>
                            ◀ Prev
                          </Button>
                        )}

                        {/* Post List Button */}
                        <Link
                          href={`/p/${country}/${city}/${subCity}/categories/${category}/${subCategory}/post-list`}
                          passHref
                          legacyBehavior
                        >
                          <Button variant="secondary" as="a">
                            ▲
                          </Button>
                        </Link>

                        {/* Next Post Button */}
                        {post_DATA?.next_post_id ? (
                          <Link
                            href={`/${country}/${city}/${subCity}/${category}/${subCategory}/post-view/${slugify(
                              truncatedContent(
                                sanitizeHTML(post_DATA?.next_post_title),
                                60
                              )
                            )}/${post_DATA?.next_post_id}.html`}
                            passHref
                            legacyBehavior
                          >
                            <Button variant="primary" as="a">
                              Next ▶
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="primary" disabled>
                            Next ▶
                          </Button>
                        )}
                      </ButtonGroup>
                    )}
                  </Col>
                </Row>
                {/* Replace with Post View Component */}
                <PostView
                  isSamePost={postId == post_DATA?.id}
                  isLoading={isLoading}
                  title={post_DATA?.title || ""}
                  description={post_DATA?.description || ""}
                  postDate={post_DATA?.date || ""}
                  formattedDate={post_DATA?.formattedDate || ""}
                  relativeTime={post_DATA?.relativeTime || ""}
                  email={post_DATA?.email || ""}
                  phone={post_DATA?.phone || ""}
                  images={(post_DATA?.images || []).map((item) => ({
                    ...item,
                    src: item.path,
                    alt: `${item.id} - ${post_DATA?.title || ""}`,
                  }))}
                  tableData={
                    <Table bordered hover>
                      <tbody>
                        <tr>
                          <th width="50%">Sex</th>
                          <td>
                            {isLoading && postId != post_DATA?.id ? (
                              <CustomPlaceholder />
                            ) : (
                              post_DATA?.sex || "-"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th width="50%">Age</th>
                          <td>
                            {isLoading && postId != post_DATA?.id ? (
                              <CustomPlaceholder />
                            ) : (
                              post_DATA?.age || "-"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th width="50%">Sexual Oriantation</th>
                          <td>
                            {isLoading && postId != post_DATA?.id ? (
                              <CustomPlaceholder />
                            ) : (
                              post_DATA?.sexual_oriantation || "-"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th width="50%">Location</th>
                          <td>
                            {isLoading && postId != post_DATA?.id ? (
                              <CustomPlaceholder />
                            ) : (
                              post_DATA?.location || "-"
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  }
                />
                {/* Notice in small size, left-aligned */}
                <Row>
                  <Col className="text-start">
                    <ul className="notices">
                      <li>
                        It is ok to contact this poster with commercial
                        interests
                      </li>
                    </ul>
                  </Col>
                </Row>
                {/* Post ID, Posted, and Post Report Modal */}
                <Row className="mt-3">
                  <Col className="post-footer">
                    <div className="ft me-4">
                      Post Id:{" "}
                      {isLoading && postId != post_DATA?.id ? (
                        <CustomPlaceholder
                          as="span"
                          className="ms-1"
                          outerStyle={{ width: "50px" }}
                        />
                      ) : (
                        post_DATA?.id || "-"
                      )}
                    </div>
                    <div className="ft me-4">
                      <strong>Posted:</strong>
                      {isLoading && postId != post_DATA?.id ? (
                        <CustomPlaceholder
                          as="span"
                          className="ms-1"
                          outerStyle={{ width: "50px" }}
                        />
                      ) : (
                        <span className="post-date ms-1" onClick={toggleDate}>
                          {showPostRelativeTime
                            ? sanitizeHTML(post_DATA?.relativeTime)
                            : sanitizeHTML(post_DATA?.formattedDate)}
                        </span>
                      )}
                    </div>
                    <div className="ft">
                      <Button variant="link" onClick={handlePostReportModal}>
                        Post Report
                      </Button>
                    </div>

                    <Suspense fallback={<span />}>
                      <Modal
                        show={showReportPostModal}
                        onHide={() => setShowReportPostModal(false)}
                        className="postReportModal"
                      >
                        <Formik
                          initialValues={reportPostInitialValues}
                          validationSchema={reportFormSchema}
                          onSubmit={handleReportPostSubmit} // Formik submission handler
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
                              <AlertMessage {...alertReportMessage} />

                              <Modal.Header closeButton>
                                <Modal.Title>
                                  Make a report for this post
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <Form
                                  id="postReportForm"
                                  onSubmit={handleSubmit}
                                  className="postReportForm"
                                >
                                  <Form.Group controlId="reportEmail">
                                    <Form.Label>Enter Email</Form.Label>
                                    <Form.Control
                                      type="email"
                                      name="email"
                                      placeholder="Enter your email"
                                      value={values.email}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />

                                    {/* Display error message for email */}
                                    {errors.email && touched.email && (
                                      <div className="text-danger">
                                        {errors.email}
                                      </div>
                                    )}
                                  </Form.Group>

                                  <Form.Group
                                    controlId="reportDescription"
                                    className="mt-3"
                                  >
                                    <Form.Label>Describe Report</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      name="description"
                                      rows={3}
                                      placeholder="Describe the issue"
                                      value={values.description}
                                      // onChange={handleChange}
                                      onChange={(e) => {
                                        const filteredValue = removeHTMLTags(
                                          e.target.value
                                        );
                                        setFieldValue(
                                          "description",
                                          filteredValue
                                        );
                                      }}
                                      onBlur={handleBlur}
                                    />

                                    {/* Display error message for description */}
                                    {errors.description &&
                                      touched.description && (
                                        <div className="text-danger">
                                          {errors.description}
                                        </div>
                                      )}
                                  </Form.Group>
                                  {/* Google reCAPTCHA component */}
                                  {APP_RECAPTCHA_KEY && (
                                    <div className="mt-2">
                                      <div className="d-flex">
                                        <ReCAPTCHA
                                          key={recaptchakey}
                                          ref={recaptchaRef}
                                          sitekey={APP_RECAPTCHA_KEY} // Replace with your reCAPTCHA site key
                                          onChange={(value) =>
                                            onCaptchaChange(
                                              value,
                                              setFieldValue
                                            )
                                          }
                                          onExpired={() => {
                                            console.warn("Captcha expired.");
                                            if (recaptchaRef.current) {
                                              recaptchaRef.current.reset();
                                            }
                                            setFieldValue("googleCaptcha", "");
                                            setRecaptchaKey(
                                              (prevKey) => prevKey + 1
                                            ); // Re-render on expiry
                                          }}
                                          onErrored={() => {
                                            console.error("Captcha error.");
                                            if (recaptchaRef.current) {
                                              recaptchaRef.current.reset();
                                            }
                                            setFieldValue("googleCaptcha", "");
                                            setRecaptchaKey(
                                              (prevKey) => prevKey + 1
                                            ); // Re-render on error
                                          }}
                                        />
                                      </div>
                                      {/* Display error message for googleCaptcha */}
                                      {errors.googleCaptcha &&
                                        touched.googleCaptcha && (
                                          <div className="text-danger">
                                            {errors.googleCaptcha}
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </Form>
                              </Modal.Body>
                              <Modal.Footer>
                                {/* Submit button triggers Formik submit */}
                                <Button
                                  variant="primary"
                                  type="submit"
                                  form="postReportForm" // Link the button to the form with the id "postReportForm"
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
                                    "Send Report"
                                  )}
                                </Button>
                              </Modal.Footer>
                            </>
                          )}
                        </Formik>
                      </Modal>
                    </Suspense>
                  </Col>
                </Row>
              </>
            )}
          </div>

          <Row className="mt-3 g-2">
            {isLoading && postAds_DATA.length == 0 ? (
              <>
                {Array.from({ length: 1 }).map((_, index) => (
                  <Col key={index} className="text-center">
                    <CustomPlaceholder />
                  </Col>
                ))}
              </>
            ) : (
              <>
                {postAds_DATA.map((ad) => (
                  <Col
                    lg={12}
                    // md={6}
                    // sm={6}
                    // xs={12}
                    key={ad.id}
                    className="text-center"
                  >
                    <a href={ad?.target_url} target={"_blank"} rel="noreferrer">
                      <LazyImage
                        className="img-fluid"
                        src={ad?.path}
                        alt={ad?.name || "ads"}
                        isDynamic={false}
                      />
                    </a>
                  </Col>
                ))}
              </>
            )}
          </Row>
        </Container>
      </div>
      <SponserSites className="mt-4" />
      <Footer className="mt-4" />
    </>
  );
};

PostDetail.propTypes = {};

export default memo(PostDetail);
