import {
  getUserPostEditAPI,
  updateUserPostEditAPI,
} from "@/api/apiAuthService.js";
import { Editor } from "@tinymce/tinymce-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";

import { ROUTES } from "@/utils/constant.js";
import {
  removeATags,
  removeScriptTags,
  sanitizeFields,
} from "@/utils/helpers.js";
import { editPostFormSchema } from "@/utils/yupValidationSchema.js";
import { ErrorMessage, Formik } from "formik";

import FixedAuthHeader from "@/components/FixedAuthHeader";

// Redux
import { setAuthProps as setAuthProps_ACTION } from "@/store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

// Single memoized selector for Redux state
const storeSelectorData = createSelector(
  (state) => state.auth,
  (auth) => ({
    post_DATA: auth?.user?.post || {},
  })
);

// Dynamic Components
const AlertMessage = dynamic(() => import("@/components/AlertMessage"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

const UserPostEdit = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { postId } = router.query;

  const recaptchaRef = useRef(null);
  const APP_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || "";
  const APP_TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "";

  //:=========================
  // Redux Stores (Memoized)
  //:=========================
  // Extracting multiple state properties with a single selector
  const { post_DATA } = useSelector(storeSelectorData);

  //:========================================
  // States Declaration
  //:========================================
  const [recaptchakey, setRecaptchaKey] = useState(1); // Used to force re-render the reCAPTCHA
  const [alertMessage, setAlertMessage] = useState({
    show: false,
  });
  const [editPostFormInitialValues, seteditPostFormInitialValues] = useState({
    title: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    googleCaptcha: "",
  });
  const [isEditorLoaded, setEditorLoaded] = useState(false);

  //:========================================
  // Function Declaration
  //:========================================
  const onCaptchaChange = useCallback((value, setFieldValue) => {
    setFieldValue("googleCaptcha", value);
  }, []);

  const handleUpdatePostSubmit = useCallback(
    (values, { setSubmitting, resetForm, setFieldValue }) => {
      const sanitizedValues = sanitizeFields({ ...values, id: post_DATA.id });

      updateUserPostEditAPI(sanitizedValues)
        .then(({ message, data, code }) => {
          // Reset isSubmitting to false after the form is processed
          resetForm();
          router.push({
            pathname: ROUTES.userPostList,
            query: { MESSAGE: message, CODE: code, DATA: data },
          });
        })
        .catch((error) => {
          console.error("Error in updateUserPostEditAPI:", error);
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
    [post_DATA]
  );
  const handleEditorInit = (editor) => {
    console.log("Editor is initialized!", editor, isEditorLoaded);
    // You can perform actions like setting content or binding events here
    setEditorLoaded(true);
  };

  //:========================================
  // Effect Load Declaration
  //:========================================

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        getUserPostEditAPI(postId)
          .then((detail) => {
            dispatch(
              setAuthProps_ACTION({
                key: "user.post",
                data: detail,
              })
            );
          })
          .catch((error) => {
            console.error("Error in getUserPostEditAPI:", error);
            const { message } = error?.response?.data || {};

            setAlertMessage({
              show: true,
              type: "error",
              message: message,
              showDismissible: false,
              showHeading: false,
            });
          });
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    };

    fetchAPI();
  }, [postId]);

  useEffect(() => {
    // Update the form values when post_DATA changes
    if (post_DATA?.id) {
      seteditPostFormInitialValues({
        title: post_DATA.title,
        location: post_DATA.location,
        description: post_DATA.description,
        email: post_DATA.email,
        phone: post_DATA.phone,
        googleCaptcha: "",
      });
    }
  }, [post_DATA]);

  return (
    <>
      <FixedAuthHeader />

      <div className="userPostEdit">
        <Container className="cnt">
          <AlertMessage {...alertMessage} />
          <div className="panel-heading">
            <h3>Edit Post</h3>
          </div>
          <div className="panel-body">
            <Formik
              initialValues={editPostFormInitialValues}
              enableReinitialize
              validationSchema={editPostFormSchema}
              onSubmit={handleUpdatePostSubmit} // Formik submission handler
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
                  <Form className="new-post-form" onSubmit={handleSubmit}>
                    <Row>
                      <Col lg={8}>
                        <Form.Group className="form-group">
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Enter Title..."
                            className="req"
                            name="title"
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            name="title"
                            component="div"
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={4}>
                        <Form.Group className="form-group">
                          <Form.Control
                            size="sm"
                            type="text"
                            className="req"
                            placeholder="Enter Location..."
                            name="location"
                            value={values.location}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            name="location"
                            component="div"
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col lg={12}>
                        <Form.Group className="form-group">
                          <h3>Posting Body</h3>
                          {!isEditorLoaded && (
                            <>
                              <textarea
                                name="description"
                                value={values.description}
                                onChange={handleChange}
                                style={{ width: "100%", height: "300px" }}
                                className="req form-control form-control-sm"
                              />
                            </>
                          )}
                          {APP_TINYMCE_API_KEY && (
                            <>
                              <div
                                className="req"
                                // style={{ border: '1px solid', borderRadius: '10px' }}
                              >
                                <Editor
                                  apiKey={APP_TINYMCE_API_KEY} // Your TinyMCE API Key
                                  init={{
                                    selector: "textarea", // This is the default selector
                                    plugins: [],
                                    anchor_top: false,
                                    menubar: false,
                                    toolbar: false, // Remove the default toolbar
                                    statusbar: false,
                                    toolbar_sticky: false,
                                    autosave_ask_before_unload: true,
                                    autosave_interval: "30s",
                                    autosave_prefix: "{path}{query}-{id}-",
                                    autosave_restore_when_empty: false,
                                    autosave_retention: "2m",
                                    height: 300,
                                    branding: false,
                                  }}
                                  value={values.description}
                                  // Update Formik's value on change
                                  onEditorChange={(content) =>
                                    setFieldValue(
                                      "description",
                                      removeScriptTags(removeATags(content))
                                    )
                                  }
                                  // Mark the field as touched on blur
                                  onBlur={() =>
                                    setFieldTouched("description", true)
                                  }
                                  onInit={handleEditorInit}
                                />
                              </div>
                            </>
                          )}

                          <ErrorMessage
                            name="description"
                            component="div"
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-4">
                      <Col lg={6}>
                        <Form.Group className="form-group">
                          <Form.Control
                            size="sm"
                            type="email"
                            placeholder="Enter Email..."
                            className="req"
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
                      <Col lg={6}>
                        <Form.Group className="form-group">
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Enter Phone..."
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-danger"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
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
                    <Row>
                      <Col lg={12} className="mt-4 mb-3 text-center">
                        {/* Submit Button */}
                        <Button
                          type="submit"
                          variant="info"
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
                            "Update"
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </>
              )}
            </Formik>
          </div>
          <div className="panel-footer" />
        </Container>
      </div>
      <Footer className="bottom-fixed" />
    </>
  );
};

export default memo(UserPostEdit);
